// streamxi: first-visit setup for Torrentio + Real-Debrid (browser playback)

const React = require('react');
const { createPortal } = require('react-dom');
const { useCore } = require('stremio/core');
const { default: Button } = require('stremio/components/Button');
const styles = require('./styles');

const FLAG_KEY = 'streamxi:torrentio-setup:v2';
const REAL_DEBRID_URL = 'https://real-debrid.com/';
const CONFIGURE_URL = 'https://torrentio.strem.fun/configure';

const TorrentioPromptModal = ({ onClose }) => {
    const core = useCore();
    const [manifestUrl, setManifestUrl] = React.useState('');
    const [installing, setInstalling] = React.useState(false);
    const [error, setError] = React.useState(null);

    const finish = React.useCallback((decision) => {
        try { window.localStorage.setItem(FLAG_KEY, decision); } catch (_) { /* ignore */ }
        if (typeof onClose === 'function') onClose();
    }, [onClose]);

    const onSkip = React.useCallback(() => {
        if (installing) return;
        finish('skipped');
    }, [installing, finish]);

    const onInstall = React.useCallback(async () => {
        if (installing) return;
        const url = manifestUrl.trim();
        if (!url) {
            setError('Paste your configured Torrentio URL above.');
            return;
        }
        try {
            const parsed = new URL(url);
            if (!parsed.hostname.includes('torrentio.strem.fun') || !parsed.pathname.endsWith('manifest.json')) {
                setError('That doesn\'t look like a Torrentio manifest URL. It should be https://torrentio.strem.fun/.../manifest.json');
                return;
            }
        } catch (_) {
            setError('Not a valid URL.');
            return;
        }

        setInstalling(true);
        setError(null);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Manifest fetch failed (' + res.status + ')');
            const manifest = await res.json();
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'InstallAddon',
                    args: {
                        transportUrl: url,
                        transportName: 'http',
                        manifest,
                        flags: { official: false, protected: false }
                    }
                }
            });
            finish('installed');
        } catch (e) {
            console.error('Torrentio install failed', e);
            setError(e && e.message ? e.message : 'Install failed');
            setInstalling(false);
        }
    }, [core, installing, manifestUrl, finish]);

    React.useEffect(() => {
        const onKeyDown = ({ key }) => {
            if (key === 'Escape' && !installing) finish('skipped');
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [installing, finish]);

    return createPortal((
        <div className={styles['torrentio-modal']}>
            <div
                className={styles['backdrop']}
                onClick={!installing ? () => finish('skipped') : undefined}
            />
            <div className={styles['container']}>
                <div className={styles['title']}>Set up streams for browser playback</div>
                <div className={styles['content']}>
                    <p>
                        To play video in your browser, you need a <strong>Real-Debrid</strong> account
                        plus the <strong>Torrentio</strong> add-on configured with it. Real-Debrid
                        converts torrent streams into direct HTTPS links the browser can play.
                    </p>
                    <ol className={styles['steps']}>
                        <li>
                            Get a Real-Debrid account (~$3/mo){' '}
                            <a href={REAL_DEBRID_URL} target="_blank" rel="noopener noreferrer">
                                real-debrid.com
                            </a>
                        </li>
                        <li>
                            Open{' '}
                            <a href={CONFIGURE_URL} target="_blank" rel="noopener noreferrer">
                                torrentio.strem.fun/configure
                            </a>, paste your Real-Debrid API key under "Real Debrid", then copy
                            the generated manifest URL.
                        </li>
                        <li>Paste it below and click Install.</li>
                    </ol>
                    <input
                        type="url"
                        className={styles['url-input']}
                        placeholder="https://torrentio.strem.fun/realdebrid=.../manifest.json"
                        value={manifestUrl}
                        onChange={(e) => setManifestUrl(e.target.value)}
                        disabled={installing}
                        autoFocus
                    />
                    {error ? <p className={styles['error']}>{error}</p> : null}
                </div>
                <div className={styles['buttons']}>
                    <Button
                        className={styles['button-secondary']}
                        onClick={onSkip}
                        disabled={installing}
                    >
                        <div className={styles['label']}>Skip for now</div>
                    </Button>
                    <Button
                        className={styles['button-primary']}
                        onClick={onInstall}
                        disabled={installing}
                    >
                        <div className={styles['label']}>
                            {installing ? 'Installing…' : 'Install Torrentio'}
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    ), document.body);
};

TorrentioPromptModal.FLAG_KEY = FLAG_KEY;

module.exports = TorrentioPromptModal;

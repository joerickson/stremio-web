// streamxi: one-time prompt to install Torrentio as a default add-on

const React = require('react');
const { createPortal } = require('react-dom');
const { useCore } = require('stremio/core');
const { default: Button } = require('stremio/components/Button');
const styles = require('./styles');

const TORRENTIO_MANIFEST_URL = 'https://torrentio.strem.fun/manifest.json';
const FLAG_KEY = 'streamxi:torrentio-prompt';

const TorrentioPromptModal = ({ onClose }) => {
    const core = useCore();
    const [installing, setInstalling] = React.useState(false);
    const [error, setError] = React.useState(null);

    const finish = React.useCallback((decision) => {
        try { window.localStorage.setItem(FLAG_KEY, decision); } catch (_) { /* ignore */ }
        if (typeof onClose === 'function') onClose();
    }, [onClose]);

    const onDecline = React.useCallback(() => {
        if (installing) return;
        finish('declined');
    }, [installing, finish]);

    const onInstall = React.useCallback(async () => {
        if (installing) return;
        setInstalling(true);
        setError(null);
        try {
            const res = await fetch(TORRENTIO_MANIFEST_URL);
            if (!res.ok) throw new Error('Manifest fetch failed (' + res.status + ')');
            const manifest = await res.json();
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'InstallAddon',
                    args: {
                        transportUrl: TORRENTIO_MANIFEST_URL,
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
    }, [core, installing, finish]);

    React.useEffect(() => {
        const onKeyDown = ({ key }) => {
            if (key === 'Escape' && !installing) finish('declined');
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [installing, finish]);

    return createPortal((
        <div className={styles['torrentio-modal']}>
            <div
                className={styles['backdrop']}
                onClick={!installing ? () => finish('declined') : undefined}
            />
            <div className={styles['container']}>
                <div className={styles['title']}>Install Torrentio?</div>
                <div className={styles['content']}>
                    <p>
                        Torrentio is a community add-on that finds streams from public torrent
                        indexers. We can install it now so streams show up in the player.
                    </p>
                    <p>
                        Stream playback requires a running Stremio streaming server (the desktop
                        app or a remote one). You can uninstall Torrentio anytime from the
                        Add-ons page.
                    </p>
                    {error ? <p className={styles['error']}>Couldn't install: {error}</p> : null}
                </div>
                <div className={styles['buttons']}>
                    <Button
                        className={styles['button-secondary']}
                        onClick={onDecline}
                        disabled={installing}
                    >
                        <div className={styles['label']}>No thanks</div>
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

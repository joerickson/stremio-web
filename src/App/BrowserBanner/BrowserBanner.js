// streamxi: warn WebKit-based browsers (Safari + all iOS browsers)
// about codec limitations that break torrent playback.

const React = require('react');
const Bowser = require('bowser');
const styles = require('./styles');

const FLAG_KEY = 'streamxi:browser-banner-dismissed';

const isWebKit = () => {
    try {
        const parser = Bowser.getParser(window.navigator?.userAgent || '');
        const engine = (parser.getEngineName() || '').toLowerCase();
        return engine === 'webkit';
    } catch (_) {
        return false;
    }
};

const BrowserBanner = () => {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        if (!isWebKit()) return;
        try {
            if (window.localStorage.getItem(FLAG_KEY) === '1') return;
        } catch (_) { /* ignore */ }
        setVisible(true);
    }, []);

    const dismiss = React.useCallback(() => {
        try { window.localStorage.setItem(FLAG_KEY, '1'); } catch (_) { /* ignore */ }
        setVisible(false);
    }, []);

    if (!visible) return null;

    return (
        <div className={styles['browser-banner']}>
            <div className={styles['label']}>
                Safari and iOS browsers can't play most torrent video formats (MKV / AC-3 / DTS).
                For best results, use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Firefox</strong> on desktop.
            </div>
            <button className={styles['close']} onClick={dismiss} aria-label="Dismiss">×</button>
        </div>
    );
};

module.exports = BrowserBanner;

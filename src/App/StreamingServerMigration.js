// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useCore } = require('stremio/core');
const { withCoreSuspender, useProfile, CONSTANTS } = require('stremio/common');

// A localhost/127.0.0.1 streaming-server URL (any port/format). This is the
// stock default and also what a fresh account tends to have synced.
const LOCAL_DEFAULT_RE = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/i;

// Keep every device on the central streaming server.
//
// stremio-core seeds fresh profiles with a localhost URL that only works if the
// user runs a local server. We switch that over to DEFAULT_STREAMING_SERVER_URL
// (the central server). We do NOT gate this behind a run-once flag: the streaming
// server URL syncs with the Stremio account, so logging in overwrites our value
// back to the account's localhost default -- we must re-apply after that, not just
// on first load. Re-applying also pushes the central URL up to the account (via
// UpdateSettings while logged in), so all devices converge on it. Once the active
// URL is the central one, the condition is false and this becomes a no-op.
const StreamingServerMigration = () => {
    const core = useCore();
    const profile = useProfile();

    React.useEffect(() => {
        const settings = profile && profile.settings;
        const current = settings && settings.streamingServerUrl;
        // Wait until the profile settings have actually loaded.
        if (typeof current !== 'string' || current.length === 0) {
            return;
        }

        const target = CONSTANTS.DEFAULT_STREAMING_SERVER_URL;
        if (LOCAL_DEFAULT_RE.test(current) && current !== target) {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...settings,
                        streamingServerUrl: target,
                    },
                },
            });
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'AddServerUrl',
                    args: target,
                },
            });
        }
    }, [profile]);

    return null;
};

module.exports = withCoreSuspender(StreamingServerMigration);

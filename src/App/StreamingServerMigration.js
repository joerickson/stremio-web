// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useCore } = require('stremio/core');
const { withCoreSuspender, useProfile, CONSTANTS } = require('stremio/common');

// Bumped if we ever need to re-run the migration for all users.
const MIGRATION_FLAG = 'streamxi_streaming_server_migrated_v1';

// One-time adoption of the central streaming server.
//
// stremio-core seeds fresh profiles with LEGACY_STREAMING_SERVER_URL
// (http://127.0.0.1:11470/), which only works if the user runs a local server.
// On first load we switch any profile still on that untouched default over to
// the central server (DEFAULT_STREAMING_SERVER_URL), then record a flag so we
// never override a URL the user deliberately chose later.
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

        try {
            if (window.localStorage.getItem(MIGRATION_FLAG)) {
                return;
            }
        } catch (e) {
            // localStorage unavailable (private mode) — skip, don't loop.
            return;
        }

        const target = CONSTANTS.DEFAULT_STREAMING_SERVER_URL;
        if (current === CONSTANTS.LEGACY_STREAMING_SERVER_URL && target !== current) {
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

        try {
            window.localStorage.setItem(MIGRATION_FLAG, '1');
        } catch (e) {
            // ignore
        }
    }, [profile]);

    return null;
};

module.exports = withCoreSuspender(StreamingServerMigration);

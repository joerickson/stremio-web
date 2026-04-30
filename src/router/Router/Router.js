// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { HashRouter } = require('react-router-dom');
const { useNavigate } = require('react-router');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useServices } = require('stremio/services');
const DeepLinkHandler = require('stremio/App/DeepLinkHandler');
const { default: OpenMediaHandler } = require('stremio/App/OpenMediaHandler');
const { default: Routes } = require('./Routes');

const KeyboardNavigationHandler = () => {
    const { keyboardShortcuts } = useServices();
    const navigate = useNavigate();
    React.useEffect(() => {
        if (!keyboardShortcuts) return;
        const onNavigate = (target) => navigate(target);
        keyboardShortcuts.on('navigate', onNavigate);
        return () => keyboardShortcuts.off('navigate', onNavigate);
    }, [navigate, keyboardShortcuts]);
    return null;
};

const Router = ({ className }) => {

    return (
        <div className={classnames(className, 'routes-container')}>
            <HashRouter>
                <DeepLinkHandler />
                <OpenMediaHandler />
                <KeyboardNavigationHandler />
                <Routes />
            </HashRouter>
        </div>
    );
};

Router.propTypes = {
    className: PropTypes.string,
};

module.exports = Router;

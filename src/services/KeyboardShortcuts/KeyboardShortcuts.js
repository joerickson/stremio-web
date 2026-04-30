// Copyright (C) 2017-2023 Smart code 203358507

const EventEmitter = require('eventemitter3');

function KeyboardShortcuts() {
    let active = false;

    const events = new EventEmitter();

    function onKeyDown(event) {
        if (event.keyboardShortcutPrevented || event.target.tagName === 'INPUT' || event.altKey || event.shiftKey || event.metaKey) {
            return;
        }

        switch (event.code) {
            case 'Digit0': {
                if (event.ctrlKey) break;
                event.preventDefault();
                events.emit('navigate', '/search');
                break;
            }
            case 'Digit1': {
                if (event.ctrlKey) break;
                event.preventDefault();
                events.emit('navigate', '/');
                break;
            }
            case 'Digit2': {
                if (event.ctrlKey) break;
                event.preventDefault();
                events.emit('navigate', '/discover');
                break;
            }
            case 'Digit3': {
                if (event.ctrlKey) break;
                event.preventDefault();
                events.emit('navigate', '/library');
                break;
            }
            case 'Digit4': {
                if (event.ctrlKey) break;
                event.preventDefault();
                events.emit('navigate', '/calendar');
                break;
            }
            case 'Digit5': {
                if (event.ctrlKey) break;
                event.preventDefault();
                events.emit('navigate', '/addons');
                break;
            }
            case 'Digit6': {
                if (event.ctrlKey) break;
                event.preventDefault();
                events.emit('navigate', '/settings');
                break;
            }
            case 'Backspace': {
                event.preventDefault();
                events.emit('navigate', event.ctrlKey ? 1 : -1);
                break;
            }
        }
    }
    function onStateChanged() {
        events.emit('stateChanged');
    }

    Object.defineProperties(this, {
        active: {
            configurable: false,
            enumerable: true,
            get: function() {
                return active;
            }
        }
    });

    this.on = function(...args) {
        events.on(...args);
    };

    this.off = function(...args) {
        events.off(...args);
    };

    this.start = function() {
        if (active) {
            return;
        }

        window.addEventListener('keydown', onKeyDown);
        active = true;
        onStateChanged();
    };
    this.stop = function() {
        window.removeEventListener('keydown', onKeyDown);
        active = false;
        onStateChanged();
    };
}

module.exports = KeyboardShortcuts;

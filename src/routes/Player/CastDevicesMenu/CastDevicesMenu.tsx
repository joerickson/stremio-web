// Copyright (C) 2017-2026 Smart code 203358507

import React, { forwardRef, memo, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Option from '../OptionsMenu/Option';
import styles from './styles.less';

type CastDevice = {
    id: string,
    name: string,
};

type Props = {
    className: string,
    devices: CastDevice[],
    onDeviceSelected: (deviceId: string) => void,
};

const CastDevicesMenu = memo(forwardRef<HTMLDivElement, Props>(({ className, devices, onDeviceSelected }, ref) => {
    const { t } = useTranslation();

    const onMouseDown = (event: MouseEvent) => {
        // @ts-expect-error: Property 'castDevicesMenuClosePrevented' does not exist on type 'MouseEvent'.
        event.nativeEvent.castDevicesMenuClosePrevented = true;
    };

    return (
        <div ref={ref} className={classNames(className, styles['cast-devices-menu-container'])} onMouseDown={onMouseDown}>
            {
                devices.map(({ id, name }) => (
                    <Option
                        key={id}
                        icon={'cast'}
                        label={t('PLAYER_PLAY_IN', { device: name })}
                        deviceId={id}
                        onClick={onDeviceSelected}
                    />
                ))
            }
        </div>
    );
}));

export default CastDevicesMenu;

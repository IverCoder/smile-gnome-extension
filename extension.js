/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * 
 * Author: Lorenzo Paderi
 */

const { GLib, Gio, Gdk, Clutter } = imports.gi;

class Extension {
    constructor() {
        // console.log('extension initialized');
        this.virtualKeyboard = undefined;
    }

    getVirtualKeyboard() {
        if (this.virtualKeyboard) {
            return this.virtualKeyboard;
        }

        let deviceType = Clutter.InputDeviceType.KEYBOARD_DEVICE;
        this.virtualKeyboard = Clutter.get_default_backend().get_default_seat().create_virtual_device(deviceType);

        return this.virtualKeyboard;
    }

    pasteEmoji(text) {
        // let clipboard = Gdk.Clipboard();

        // if (clipboard.get_content().get_value() !== text) {
        //     let contextProvider = Gdk.ContentProvider.new_for_value(text);
        //     clipboard.set_value(contextProvider);
        // }
        const eventTime = Clutter.get_current_event_time() * 1000;

        this.timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 250, () => {
            this.getVirtualKeyboard().notify_keyval(eventTime, Clutter.KEY_Control_L, Clutter.KeyState.RELEASED);
            this.getVirtualKeyboard().notify_keyval(eventTime, Clutter.KEY_Control_L, Clutter.KeyState.PRESSED);
            this.getVirtualKeyboard().notify_keyval(eventTime, Clutter.KEY_v, KeyState.PRESSED);
            this.getVirtualKeyboard().notify_keyval(eventTime, Clutter.KEY_Control_L, Clutter.KeyState.RELEASED);
            this.getVirtualKeyboard().notify_keyval(eventTime, Clutter.KEY_v, Clutter.KeyState.RELEASED);
            if (this.timeoutId) {
                GLib.Source.remove(this.timeoutId);
            }

            this.timeoutId = undefined;
        });
    }

    enable() {
        this.systemdSignalId = Gio.DBus.session.signal_subscribe(
            null,
            'it.mijorus.smile',
            'CopiedEmoji',
            '/it/mijorus/smile',
            null,
            Gio.DBusSignalFlags.NONE,
            () => this.pasteEmoji(),
        );
    }

    disable() {
        if (this.loop) {
            this.loop.quit();
        }
    }
}

function init() {
    return new Extension();
}

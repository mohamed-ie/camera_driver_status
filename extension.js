import St from "gi://St";
import GLib from "gi://GLib";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";

export default class ExampleExtension extends Extension {
  enable() {
    let isCameraOn = () => {
      let [result, stdout] = GLib.spawn_command_line_sync(
        'bash -c "lsmod | grep uvcvideo"'
      );
      return result && stdout.toString().trim() !== "";
    };

    this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);

    this.icon = new St.Icon({
      icon_name: `camera-${isCameraOn() ? "on" : "off"}-symbolic`,
      style_class: "camera-icon",
      icon_size: 24,
    });

    this.button = new St.Button({
      reactive: true,
      can_focus: true,
      track_hover: true,
      style_class: "camera-driver-status-button",
    });

    let updateIconName = () =>
      (this.icon.icon_name = `camera-${isCameraOn() ? "on" : "off"}-symbolic`);

    this.button.connect("clicked", () => {
      GLib.spawn_command_line_async(
        `pkexec modprobe -${isCameraOn() ? "r" : "a"} uvcvideo`
      );
    });

    this.button.set_child(this.icon);
    this._indicator.add_child(this.button);

    //incase driver loaded from other source
    GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, updateIconName);

    // Add the indicator to the panel
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    this._indicator?.destroy();
    this._indicator = null;
  }
}

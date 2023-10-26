const { St, GLib, Gio } = imports.gi;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let panelButton, panelButtonIcon;

function isCameraOn() {
  let [success, stdout] = GLib.spawn_command_line_sync(
    'bash -c "lsmod | grep uvcvideo"'
  );
  return success && stdout.toString().trim() !== "";
}

function init() {
  panelButton = new St.Bin({
    reactive: true,
    can_focus: true,
    track_hover: true,
    style_class: "panel-button",
  });

  panelButtonIcon = new St.Icon({
    reactive: true,
    style_class: "system-status-icon",
  });

  panelButton.set_child(panelButtonIcon);

  panelButton.connect("button-press-event", () => {
    GLib.spawn_command_line_async(
      `pkexec sudo modprobe -${isCameraOn() ? "r" : "a"} uvcvideo`
    );
  });
}

let updateIcon = () =>
  panelButtonIcon.set_gicon(
    Gio.icon_new_for_string(
      Me.dir.get_path() + `/webcam-${isCameraOn() ? "duotone" : "slash-duotone"}.svg`
    )
  );

function enable() {
  Main.panel._rightBox.insert_child_at_index(panelButton, 1);

  // In case driver is loaded from another source
  GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
    updateIcon();
    return true;
  });
}

function disable() {
  Main.panel._rightBox.remove_child(panelButton);
}

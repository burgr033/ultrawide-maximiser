import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class UWMaximiser extends Extension {
  gsettings?: Gio.Settings;
  windowCreatedSignal?: number;

  init() { }

  enable() {
    this.gsettings = this.getSettings("org.gnome.shell.extensions.uw-maximiser");
    this.windowCreatedSignal = global.display.connect('window-created', (_display, win) => {
      win.connect('notify::maximized-horizontally', () => this.checkWindowMaximized(win));
      win.connect('notify::maximized-vertically', () => this.checkWindowMaximized(win));
    });
  }

  disable() {
    if (this.windowCreatedSignal) {
      global.display.disconnect(this.windowCreatedSignal);
      this.windowCreatedSignal = 0;
    }
  }

  checkWindowMaximized(window: Meta.Window) {
    if (window.maximized_horizontally && window.maximized_vertically) {
      this.onWindowMaximize(window);
    }
  }

  onWindowMaximize(window: Meta.Window) {
    if (!window || window.get_monitor() === -1) return;
    if (!this.gsettings) return;

    let monitorIndex = window.get_monitor();
    let monitor = global.display.get_monitor_geometry(monitorIndex);

    if (!this.isUltrawide(monitor)) {
      console.debug(`Monitor is not ultrawide, skipping window adjustment`);
      return;
    }

    console.debug(`Adjusting window on ultrawide monitor (${monitor.width}x${monitor.height})`);

    let widthPercent = this.gsettings.get_int('window-width-percent') / 100;
    let newWidth = Math.floor(monitor.width * widthPercent);
    let newHeight = monitor.height;
    let x = monitor.x + Math.floor((monitor.width - newWidth) / 2);
    let y = monitor.y;

    window.unmaximize(Meta.MaximizeFlags.BOTH);
    window.move_resize_frame(true, x, y, newWidth, newHeight);
  }

  isUltrawide(monitor: Mtk.Rectangle) {
    const aspectRatio = monitor.width / monitor.height;
    const ultrawideThreshold = 2.0;
    console.debug(`Monitor aspect ratio: ${aspectRatio.toFixed(2)}, width: ${monitor.width}, height: ${monitor.height}`);
    return aspectRatio >= ultrawideThreshold;
  }
}

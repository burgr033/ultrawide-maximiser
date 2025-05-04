import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class GnomeRectanglePreferences extends ExtensionPreferences {
  _settings?: Gio.Settings

  fillPreferencesWindow(window: Adw.PreferencesWindow): Promise<void> {
    this._settings = this.getSettings();

    const page = new Adw.PreferencesPage({
      title: _('General'),
      iconName: 'dialog-information-symbolic',
    });

    const generalGroup = new Adw.PreferencesGroup({
      title: _('General'),
    });
    page.add(generalGroup);
    const windowWidthPercent = new Adw.SpinRow({
      title: _('Width percentage'),
      subtitle: _('Percentage of screen width to use when maximizing on ultrawide monitors.'),
      receives_default: true,
      adjustment: new Gtk.Adjustment({
        lower: 0,
        upper: 100,
        stepIncrement: 5
      })
    });
    generalGroup.add(windowWidthPercent);

    const aspectRatio = new Adw.SpinRow({
      title: _('Width percentage'),
      subtitle: _('Percentage of screen width to use when maximizing on ultrawide monitors.'),
      receives_default: true,
      adjustment: new Gtk.Adjustment({
        lower: 0.5,
        upper: 4.0,
        stepIncrement: 0.1
      })
    });
    generalGroup.add(aspectRatio);

    window.add(page)

    this._settings!.bind('window-width-percent', windowWidthPercent, 'value', Gio.SettingsBindFlags.DEFAULT);
    this._settings!.bind('aspect-ratio-threshold', aspectRatio, 'value', Gio.SettingsBindFlags.DEFAULT);

    return Promise.resolve();
  }
}

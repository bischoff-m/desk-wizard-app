# Developer Notes

Unstructured notes that can later be compiled into an actual documentation.

## Setup

### Set DeskWizard as Wallpaper

I looked at Lively and Wallpaper Engine. Lively requires the user to click the desktop
before he can interact with the wallpaper. Also, the content is scaled to 80%, which makes
the non dpi-aware content appear bigger.

It would be nice to support both, but for now, I'll try to get the experience smooth for
Wallpaper Engine.

#### Reload the Wallpaper after Boot

If Wallpaper Engine or Lively starts before DeskWizard, the wallpaper cannot be loaded. We
need to reload the wallpaper once DeskWizard is started.

##### Wallpaper Engine

- Click "Displays" in the top right
- Group the displays
- Save profile as "Spanning"

DeskWizard will run the following command after starting to reload the wallpaper:

```powershell
.\wallpaper64.exe -control openProfile -profile "Spanning"
```

Right now, the profile name and the path to the binary are hardcoded.

##### Lively

Lively provides a CLI `Livelycu.exe` that can be called to reload the wallpaper:

```powershell
.\Livelycu.exe setwp --file reload
```

This binary can be bundled with the app ([see
here](https://v2.tauri.app/develop/resources/)). The file should be placed at
`./src-tauri/resources/Livelycu.exe`. The `tauri.conf.json` should be updated to include

```json
{
  "bundle": {
    "resources": ["resources/**/*"]
  }
}
```

With this setup, the following function should be called in the `tauri::Builder.setup`
method:

```rust
pub fn reload_lively(app: &tauri::App) -> () {
  let lively_path = app
    .path()
    .resolve("resources/Livelycu.exe", BaseDirectory::Resource)
    .unwrap();

  Command::new(lively_path.to_str().unwrap())
    .args(["setwp", "--file", "reload"])
    .spawn()
    .expect("failed to run lively");
}
```

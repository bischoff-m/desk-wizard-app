import { PluginBase, WidgetManager } from "desk-wizard";

export class WallpaperPlugin extends PluginBase {
  constructor(manager: WidgetManager) {
    super(manager);
  }

  public onStartup() {
    // TODO: Move ScreenWrapper to plugin
    // this.manager.newWidget(
    //   new ImagePickerWidget("image-picker-1", this.manager, setImg),
    // );
  }

  public renderIcon() {
    return <div>🖼️</div>;
  }
}

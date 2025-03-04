import { Widget, type WidgetManager } from "desk-wizard";
import ImagePicker, { SetImageFunction } from "./ImagePicker";

export class ImagePickerWidget extends Widget {
  setImg: SetImageFunction;

  constructor(key: string, manager: WidgetManager, setImg: SetImageFunction) {
    super(key, manager);
    this.setImg = setImg;
  }

  public getTitle(): string {
    return "Image Picker";
  }

  public renderIcon(): React.JSX.Element {
    return <div>🖼️</div>;
  }

  public render() {
    return <ImagePicker setImg={this.setImg} />;
  }
}

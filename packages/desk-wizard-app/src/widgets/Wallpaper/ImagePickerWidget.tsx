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

  public render() {
    return <ImagePicker setImg={this.setImg} />;
  }

  public getInitialProps() {
    return {
      default: {
        x: 2200,
        y: 600,
        width: 800,
        height: null,
      },
    };
  }
}

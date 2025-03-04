import { createElement } from "react";
import { type WidgetManager, Widget } from "desk-wizard";
import { createRoot, Root } from "react-dom/client";
import DeskWidgetView from "@/components/WidgetView";

export class DeskWidgetManager implements WidgetManager {
  widgets: Map<string, Widget> = new Map();
  widgetRoots: Map<string, Root> = new Map();

  constructor() {}

  public newWidget(widget: Widget) {
    const key = widget.getKey();
    if (this.widgets.has(key)) throw new Error("Widget already exists");
    this.widgets.set(key, widget);

    // Create a new div element for the widget
    const rootContainer = document.getElementById("widget-root");
    const widgetRootElement = document.createElement("div");
    widgetRootElement.id = key;
    rootContainer?.appendChild(widgetRootElement);

    // Create a new wrapper component
    const wrapperElement = createElement(
      DeskWidgetView,
      {
        widget: widget,
      },
      widget.render(),
    );

    // Create a new root and wrapper
    const widgetRoot = createRoot(widgetRootElement);
    this.widgetRoots.set(key, widgetRoot);

    // Render the component
    widgetRootElement.style.opacity = "0";
    widgetRoot.render(wrapperElement);
    widget.onLoad?.();
    widgetRootElement.style.opacity = "1";
  }

  public destroyWidget(key: string) {
    const widget = this.widgets.get(key);
    if (!widget) throw new Error("Widget not found");

    const widgetRoot = this.widgetRoots.get(key);
    widgetRoot?.unmount();
    document.getElementById(key)?.remove();

    this.widgets.delete(key);
    this.widgetRoots.delete(key);
  }
}

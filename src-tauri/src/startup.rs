use std::process::Command;

use tauri::{
    menu::{ Menu, MenuItem },
    path::BaseDirectory,
    tray::{ MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent },
    Manager,
};

pub fn reload_lively(app: &tauri::App) -> () {
    let lively_path = app
        .path()
        .resolve("resources/Livelycu.exe", BaseDirectory::Resource)
        .unwrap();

    // Reload the lively wallpaper
    Command::new("cmd")
        .args(["/C", "start", lively_path.to_str().unwrap(), "setwp", "--file", "reload"])
        .spawn()
        .expect("failed to run lively");
}

pub fn build_tray_icon(app: &tauri::App) -> TrayIconBuilder<tauri::Wry> {
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>).unwrap();
    let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>).unwrap();
    let menu = Menu::with_items(app, &[&show_i, &quit_i]).unwrap();

    // Build the tray icon
    let builder = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .menu_on_left_click(true)
        // Set handlers for menu events
        .on_menu_event(|app: &tauri::AppHandle<tauri::Wry>, event| {
            let window = app.get_webview_window("main").unwrap();
            match event.id.as_ref() {
                "quit" => {
                    app.exit(0);
                }
                "show" => {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
                _ => {}
            }
        })
        // Show the window on tray icon click
        .on_tray_icon_event(|tray, event| {
            match event {
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } => {
                    let app = tray.app_handle();
                    let window = app.get_webview_window("main").unwrap();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
                _ => {}
            }
        });
    return builder;
}

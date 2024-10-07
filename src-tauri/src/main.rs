// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{path::Path, process::Command};

extern crate rocket;
use rocket::fs::{relative, FileServer};

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[rocket::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // mount the rocket instance
            tauri::async_runtime::spawn(async move {
                let _rocket = rocket::build()
                    .mount("/", FileServer::from(relative!("../out/")))
                    .launch()
                    .await;
            });

            // reload the lively wallpaper
            let lively_path = Path::new(relative!("../lively/livelycu.exe")).to_path_buf();
            Command::new("cmd")
                .args([
                    "/C",
                    "start",
                    lively_path.to_str().unwrap(),
                    "setwp",
                    "--file",
                    "reload",
                ])
                .spawn()
                .expect("failed to run lively");

            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            // build the tray icon
            TrayIconBuilder::new()
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
                .on_tray_icon_event(|tray, event| match event {
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
                })
                .build(app)?;

            Ok(())
        })
        // Hide on close
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

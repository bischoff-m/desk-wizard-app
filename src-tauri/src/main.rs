// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate rocket;

use rocket::fs::{ relative, FileServer };
use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_autostart::ManagerExt;

mod startup;

#[tauri::command]
async fn redirect(app_handle: tauri::AppHandle) {
    let mut window = app_handle.get_webview_window("main").unwrap();
    let mut window_url = window.url().unwrap();
    let path = window_url.path();
    if
        window_url.to_string() == "about:blank" ||
        !window_url.has_host() ||
        path == "/native-app"
    {
        return;
    }
    window_url.set_path("/native-app");
    window.navigate(window_url).unwrap();
}

#[rocket::main]
async fn main() {
    tauri::Builder
        ::default()
        .setup(|app| {
            // Enable autostart
            let _ = app
                .handle()
                .plugin(
                    tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![]))
                );
            let autostart_manager = app.autolaunch();
            let _ = autostart_manager.enable();

            // Mount the rocket instance
            tauri::async_runtime::spawn(async move {
                let _rocket = rocket
                    ::build()
                    .mount("/", FileServer::from(relative!("../out/")))
                    .launch().await;
            });

            startup::reload_wallpaper();
            startup::build_tray_icon(app).build(app)?;

            Ok(())
        })
        // Hide on close
        .on_window_event(|window, event| {
            match event {
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    window.hide().unwrap();
                    api.prevent_close();
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![redirect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate rocket;

use rocket::fs::{ relative, FileServer };
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_autostart::ManagerExt;

mod startup;

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
                    .mount("/", FileServer::from(relative!("../dist/")))
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

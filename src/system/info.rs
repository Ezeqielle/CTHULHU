use sysinfo::{System, SystemExt, DiskExt};
use os_info::{self, Type, Version};
use std::path::PathBuf;
use whoami;
use home;

pub fn get_disks() -> Vec<String> {
    let sys = System::new_all();

    let mut target_mounted_point: Vec<String> = Vec::new();

    for disk in sys.disks() {
        target_mounted_point.push(String::from(disk.mount_point().to_str().unwrap()));
    }

    return target_mounted_point;
}

pub fn get_version() -> String {
    let os_info = os_info::get();
    let os_fullname = match os_info.os_type() {
        Type::Windows => String::from("Windows"),
        _ => String::from("Unknown"),
    };

    let os_version = match os_info.version() {
        Version::Semantic(sem_1, sem_2, sem_3) => format!("{}.{}.{}", sem_1, sem_2, sem_3),
        Version::Custom(version) => version.to_string(),
        _ => "Unknown".to_string()
    };

    os_fullname + " " + &os_version
}

pub fn get_hostname() -> String {
    whoami::hostname()
}

pub fn get_username() -> String {
    // Get the username of the current user
    whoami::username()
}

pub fn get_user_home() -> PathBuf {
    match home::home_dir() {
        Some(path) => path,
        None => PathBuf::from("unknown"),
    }
}
use sysinfo::{System, SystemExt, DiskExt};

pub fn get_disks() -> Vec<String> {
    let sys = System::new_all();

    let mut target_mounted_point: Vec<String> = Vec::new();

    for disk in sys.disks() {
        target_mounted_point.push(String::from(disk.mount_point().to_str().unwrap()));
    }

    return target_mounted_point;
}
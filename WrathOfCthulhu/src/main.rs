use sysinfo::{System, SystemExt, DiskExt};

#[derive(Debug)]
struct TargetInfo {
    target_name: String,
    target_kernel: String,
    target_osversion: String,
    target_host_name: String
}

fn get_infos() -> TargetInfo {
    let mut sys = System::new_all();
    sys.refresh_all();

    let target = TargetInfo {
        target_name: sys.name().unwrap(),
        target_kernel: sys.kernel_version().unwrap(),
        target_osversion: sys.os_version().unwrap(),
        target_host_name: sys.host_name().unwrap()
    };

    return target;
}

fn get_disks() -> Vec<String> {
    let sys = System::new_all();

    let mut target_mounted_point: Vec<String> = Vec::new();

    for disk in sys.disks() {
        target_mounted_point.push(String::from(disk.mount_point().to_str().unwrap()));
    }

    return target_mounted_point;
}

fn main() {
    println!("{:?}", get_infos());
    println!("{:?}", get_disks());
}

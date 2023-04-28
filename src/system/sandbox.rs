/* extern crate winapi;
extern crate num_cpus;
 */
use winapi::um::debugapi::{IsDebuggerPresent};
use std::{path::Path};
use std::time::Duration;
use std::{thread, process};
use sysinfo::{Pid, System, SystemExt, UserExt, DiskExt, ProcessExt, NetworkExt, PidExt};
use enigo::Enigo;

pub fn is_debugger_detected() -> bool {
    unsafe {
        match IsDebuggerPresent() {
            0 => {
                false
            },
            _ => {
                true
            }
        }
    }
}

pub fn is_sandbox_detected() -> bool{
    let mut is_process_in_sandbox = false;
    let sys = System::new_all();
    let suspicious_renamed_executable = ["sample.exe", "bot.exe", "sandbox.exe", "malware.exe", "test.exe", "klavme.exe", "myapp.exe", "testapp.exe", "infected.exe"];
    let suspicious_user_names = ["CurrentUser", "Sandbox", "Emily", "HAPUBWS", "Hong Lee", "IT-ADMIN", "Johnson", "Miller", "milozs", "Peter Wilson", "timmy", "user", "sand box", "malware",
                                            "maltest", "test user", "virus", "John Doe", "SANDBOX", "7SILVIA", "HANSPETER-PC", "JOHN-PC", "MUELLER-PC", "WIN7-TRAPS", "FORTINET", "TEQUILABOOMBOOM"];
    let mut current_users_on_system: Vec<&str> = Vec::new();
    let suspicious_processes_running = ["vboxservice.exe", "vboxtray.exe", "VMSrvc.exe", "VMUSrvc.exe", "qemu-ga.exe", "vdagent.exe", "vdservice.exe", "xenservice.exe", "tcpview.exe", "wireshark.exe", "fiddler.exe", "vmware.exe", "procexp.exe", "df5serv.exe", "autoit.exe"];
    let mut current_processes_running: Vec<&str> = Vec::new();

    for suspicous_process in suspicious_renamed_executable {
        for _process in sys.processes_by_name(suspicous_process){
            is_process_in_sandbox = true;
        }
    }

    for user in sys.users() {
        current_users_on_system.push(user.name());
    }
    for user in suspicious_user_names {
        if current_users_on_system.contains(&user) {
            is_process_in_sandbox = true;
        }
    }

    for user in current_users_on_system {
        if user == "Wilber" && (sys.host_name().unwrap().starts_with("SC") || sys.host_name().unwrap().starts_with("SW")) {
            is_process_in_sandbox = true;
        }
        if user == "admin" && (sys.host_name().unwrap() == "SystemIT" || sys.host_name().unwrap() == "KLONE_X64-PC") {
            is_process_in_sandbox = true;
        }
        if user == "John" && (Path::new("C:\\take_screenshot.ps1").exists() && Path::new("C:\\loaddll.exe").exists()) {
            is_process_in_sandbox = true;
        }
    }

    if Path::new("C:\\email.doc").exists() &&
        Path::new("C:\\email.htm").exists() &&
        Path::new("C:\\123\\email.doc").exists() &&
        Path::new("C:\\123\\email.docx").exists() {
        is_process_in_sandbox = true;
    }

    if num_cpus::get_physical() < 2 {
        is_process_in_sandbox = true;
    }

    for disk in sys.disks() {
        if disk.mount_point().to_str().unwrap() == "C:\\" && disk.total_space() < 85899345920 {
            is_process_in_sandbox = true
        }
    }

    let enigo = Enigo::new();
    let cursor_position_t1 = enigo::MouseControllable::mouse_location(&enigo);
    thread::sleep(Duration::from_secs(10));
    let cursor_position_t2 = enigo::MouseControllable::mouse_location(&enigo);
    if cursor_position_t1 == cursor_position_t2 {
        is_process_in_sandbox = true
    }

    if sys.total_memory() < 1073741824 {
        is_process_in_sandbox = true
    }

    for (_pid, process) in sys.processes() {
        current_processes_running.push(process.name())
    }
    for process in suspicious_processes_running {
        if current_processes_running.contains(&process) {
            is_process_in_sandbox = true
        }
    }

    if let Some(process) = sys.process(Pid::from_u32(process::id())){
        if let Some(parent_process) = sys.process(Pid::from(process.parent().unwrap())) {
            if parent_process.name() != "explorer.exe" || parent_process.name() != "powershell.exe" || parent_process.name() != "cmd.exe" {
                is_process_in_sandbox = true
            }
        }
    }

    let networks = sys.networks();
    for (_interface_name, network) in networks {
        if network.mac_address().to_string().starts_with("00:05:69") || network.mac_address().to_string().starts_with("00:0c:29") || network.mac_address().to_string().starts_with("00:1C:14") 
        || network.mac_address().to_string().starts_with("00:50:56")  || network.mac_address().to_string().starts_with("08:16:3E") || network.mac_address().to_string().starts_with("08:00:27") {
            is_process_in_sandbox = true
        }
    }

    return is_process_in_sandbox;
}

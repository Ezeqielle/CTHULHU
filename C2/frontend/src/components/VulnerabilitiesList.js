const VulnerabilitiesList = () => (
  <div class="container-fluid">
    <h3 class="text-dark mb-4">Vulnerability list</h3>
    <div class="card shadow mb-5">
      <div class="card-header py-3">
        <p class="text-primary m-0 fw-bold">Scan Name</p>
      </div>
      <div class="card-body">
        <form>
          <div class="row">
            <div class="col">
              <div class="mb-3"><label class="form-label" for="username"><strong>Type of scan&nbsp;&nbsp;</strong></label>
                <p><span class="badge rounded-pill bg-secondary">IP</span>&nbsp;Passive</p>
                <p></p>
              </div>
            </div>
            <div class="col">
              <div class="mb-3"><label class="form-label" for="username"><strong>Duration</strong></label>
                <p>Paragraph</p>
              </div>
            </div>
            <div class="col">
              <div class="mb-3"><label class="form-label" for="username"><strong>Creation</strong></label>
                <p>Paragraph</p>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="mb-3"><label class="form-label" for="username"><strong>IP</strong></label>
                <p>24/01/2022 21h06</p>
              </div>
            </div>
            <div class="col">
              <div class="mb-3"><label class="form-label" for="username"><strong>Start Date</strong></label>
                <p>24/01/2022 21h06</p>
                <p></p>
              </div>
            </div>
            <div class="col">
              <div class="mb-3"><label class="form-label" for="username"><strong>End Date</strong></label>
                <p>24/01/2022 21h07<br /></p>
              </div>
            </div>
          </div>
          <div class="mb-3"></div>
        </form>
      </div>
    </div>
    <div class="card shadow">
      <div class="card-header py-3">
        <p class="text-primary m-0 fw-bold">Vulnerabilities</p>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6 col-xl-12 offset-xl-0">
            <div class="text-md-end dataTables_filter" id="dataTable_filter-1"><label class="form-label"><input type="search" class="form-control form-control-sm" aria-controls="dataTable" placeholder="Search" /></label></div>
          </div>
        </div>
        <div class="table-responsive table mt-2" id="dataTable-1" role="grid" aria-describedby="dataTable_info">
          <table class="table my-0" id="dataTable">
            <thead>
              <tr>
                <th>CVE</th>
                <th>Service</th>
                <th>IP</th>
                <th>Port</th>
                <th>MAC Address</th>
                <th>Criticity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-25139">CVE-2022-25139</a><br /></td>
                <td>Samba</td>
                <td>127.0.0.1</td>
                <td>80</td>
                <td>00:37:6C:E2:EB:62<br /></td>
                <td class="text-dark" style="font-weight: bold;">Critical</td>
                <td><a href="vuln.html"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-external-link" data-bs-toggle="tooltip" data-bss-tooltip="" data-bs-placement="bottom" style="color: var(--bs-blue);font-size: 20px;" title="Details">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5"></path>
                  <line x1="10" y1="14" x2="20" y2="4"></line>
                  <polyline points="15 4 20 4 20 9"></polyline>
                </svg></a></td>
              </tr>
              <tr>
                <td><a href="https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-25139">CVE-2022-25139</a><br /></td>
                <td>Samba</td>
                <td>127.0.0.1</td>
                <td>80</td>
                <td>00:37:6C:E2:EB:62<br /></td>
                <td style="font-weight: bold;color: var(--bs-red);">High</td>
                <td><a href="vuln.html"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-external-link" data-bs-toggle="tooltip" data-bss-tooltip="" data-bs-placement="bottom" style="color: var(--bs-blue);font-size: 20px;" title="Details">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5"></path>
                  <line x1="10" y1="14" x2="20" y2="4"></line>
                  <polyline points="15 4 20 4 20 9"></polyline>
                </svg></a></td>
              </tr>
              <tr>
                <td><a href="https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-25139">CVE-2022-25139</a><br /></td>
                <td>Samba</td>
                <td>127.0.0.1</td>
                <td>80</td>
                <td>00:37:6C:E2:EB:62<br /></td>
                <td style="color: var(--bs-orange);font-weight: bold;">Medium</td>
                <td><a href="vuln.html"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-external-link" data-bs-toggle="tooltip" data-bss-tooltip="" data-bs-placement="bottom" style="color: var(--bs-blue);font-size: 20px;" title="Details">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5"></path>
                  <line x1="10" y1="14" x2="20" y2="4"></line>
                  <polyline points="15 4 20 4 20 9"></polyline>
                </svg></a></td>
              </tr>
              <tr>
                <td><a href="https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-25139">CVE-2022-25139</a><br /></td>
                <td>Samba</td>
                <td>127.0.0.1</td>
                <td>80</td>
                <td>00:37:6C:E2:EB:62<br /></td>
                <td style="color: var(--bs-yellow);font-weight: bold;">Low</td>
                <td><a href="vuln.html"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-external-link" data-bs-toggle="tooltip" data-bss-tooltip="" data-bs-placement="bottom" style="color: var(--bs-blue);font-size: 20px;" title="Details">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5"></path>
                  <line x1="10" y1="14" x2="20" y2="4"></line>
                  <polyline points="15 4 20 4 20 9"></polyline>
                </svg></a></td>
              </tr>
              <tr>
                <td><a href="https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-25139">CVE-2022-25139</a><br /></td>
                <td>Samba</td>
                <td>127.0.0.1</td>
                <td>80</td>
                <td>00:37:6C:E2:EB:62<br /></td>
                <td style="color: var(--bs-cyan);font-weight: bold;">Info</td>
                <td><a href="vuln.html"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-external-link" data-bs-toggle="tooltip" data-bss-tooltip="" data-bs-placement="bottom" style="color: var(--bs-blue);font-size: 20px;" title="Details">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5"></path>
                  <line x1="10" y1="14" x2="20" y2="4"></line>
                  <polyline points="15 4 20 4 20 9"></polyline>
                </svg></a></td>
              </tr>
              <tr></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
)

export default VulnerabilitiesList;
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace TheHangar
{
    static class Program
    {
        private const string AppMutexName = "Global\\TheHangar_AMOX_Instance_Mutex";
        private const string VirtualHostName = "hangar.local";
        public const string AppVersion = "1.0.0";
        public const string UpdateCheckUrl = "https://raw.githubusercontent.com/AMOXMorad/Hanger/main/version.json";

        [DllImport("user32.dll")]
        private static extern bool SetProcessDPIAware();

        [DllImport("user32.dll")]
        private static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        [DllImport("user32.dll", EntryPoint = "FindWindow", SetLastError = true)]
        private static extern IntPtr FindWindowByCaption(IntPtr ZeroOnly, string lpWindowName);

        private const int SW_RESTORE = 9;

        [STAThread]
        static void Main()
        {
            try
            {
                if (Environment.OSVersion.Version.Major >= 6)
                {
                    SetProcessDPIAware();
                }
            }
            catch { }

            bool isNewInstance;
            using (Mutex mutex = new Mutex(true, AppMutexName, out isNewInstance))
            {
                if (!isNewInstance)
                {
                    IntPtr existing = FindWindowByCaption(IntPtr.Zero, "الهنجر — ورشتك الرقمية");
                    if (existing != IntPtr.Zero)
                    {
                        ShowWindow(existing, SW_RESTORE);
                        SetForegroundWindow(existing);
                        return;
                    }
                }

                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new MainForm());
            }
        }

        public class MainForm : Form
        {
            private WebView2 _webView;
            private Panel _loadingPanel;
            private Label _loadingLabel;

            public MainForm()
            {
                InitializeWindow();
                InitializeWebView();
            }

            private void InitializeWindow()
            {
                Text = "الهنجر — ورشتك الرقمية";
                Width = 1320;
                Height = 860;
                MinimumSize = new Size(1024, 680);
                StartPosition = FormStartPosition.CenterScreen;
                BackColor = ColorTranslator.FromHtml("#f6f5f0");

                string exeDir = AppDomain.CurrentDomain.BaseDirectory;
                string icoPath = Path.Combine(exeDir, "TheHangar.ico");
                if (File.Exists(icoPath))
                {
                    try { Icon = new Icon(icoPath); } catch { }
                }

                _loadingPanel = new Panel
                {
                    Dock = DockStyle.Fill,
                    BackColor = ColorTranslator.FromHtml("#f6f5f0")
                };

                _loadingLabel = new Label
                {
                    Text = "جاري تجهيز الهنجر...",
                    Font = new Font("Segoe UI", 13, FontStyle.Bold),
                    ForeColor = ColorTranslator.FromHtml("#14232a"),
                    AutoSize = false,
                    TextAlign = ContentAlignment.MiddleCenter,
                    Dock = DockStyle.Fill
                };

                _loadingPanel.Controls.Add(_loadingLabel);
                Controls.Add(_loadingPanel);
            }

            private async void InitializeWebView()
            {
                try
                {
                    string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                    string userDataFolder = Path.Combine(localAppData, "TheHangar", "WebView2Data");
                    Directory.CreateDirectory(userDataFolder);

                    var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder, new CoreWebView2EnvironmentOptions());

                    _webView = new WebView2
                    {
                        Dock = DockStyle.Fill,
                        Visible = false
                    };
                    Controls.Add(_webView);

                    await _webView.EnsureCoreWebView2Async(env);

                    ConfigureWebView();
                    NavigateToApp();
                }
                catch (WebView2RuntimeNotFoundException)
                {
                    PromptInstallWebView2();
                }
                catch (Exception ex)
                {
                    MessageBox.Show(
                        "تعذر تشغيل واجهة البرنامج:\n" + ex.Message,
                        "خطأ في التشغيل",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
            }

            private void ConfigureWebView()
            {
                var settings = _webView.CoreWebView2.Settings;
                settings.IsStatusBarEnabled = false;
                settings.AreDefaultContextMenusEnabled = true;
                settings.IsZoomControlEnabled = true;
#if DEBUG
                settings.AreDevToolsEnabled = true;
#else
                settings.AreDevToolsEnabled = false;
#endif

                // Virtual Host Mapping
                string exeDir = AppDomain.CurrentDomain.BaseDirectory;
                string uiFolder = Path.Combine(exeDir, "ui");

                if (Directory.Exists(uiFolder))
                {
                    _webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                        VirtualHostName,
                        uiFolder,
                        CoreWebView2HostResourceAccessKind.Allow
                    );
                }

                // Handle external links -> open in default browser
                _webView.CoreWebView2.NavigationStarting += (s, e) =>
                {
                    if (string.IsNullOrEmpty(e.Uri)) return;

                    Uri uri;
                    if (Uri.TryCreate(e.Uri, UriKind.Absolute, out uri))
                    {
                        if (!uri.Host.Equals(VirtualHostName, StringComparison.OrdinalIgnoreCase))
                        {
                            e.Cancel = true;
                            LaunchExternalBrowser(e.Uri);
                        }
                    }
                };

                // Handle window.open / target="_blank"
                _webView.CoreWebView2.NewWindowRequested += (s, e) =>
                {
                    e.Handled = true;
                    if (!string.IsNullOrEmpty(e.Uri))
                    {
                        LaunchExternalBrowser(e.Uri);
                    }
                };

                // Fade out loading panel once document is ready
                _webView.NavigationCompleted += (s, e) =>
                {
                    if (_loadingPanel != null)
                    {
                        _loadingPanel.Visible = false;
                        _webView.Visible = true;
                        _webView.Focus();
                    }

                    // Check for updates in background after 3 seconds
                    System.Threading.Tasks.Task.Delay(3000).ContinueWith(delegate
                    {
                        try { Invoke(new Action(CheckForUpdates)); } catch { }
                    });
                };
            }

            private void NavigateToApp()
            {
                string exeDir = AppDomain.CurrentDomain.BaseDirectory;
                string uiFolder = Path.Combine(exeDir, "ui");

                if (Directory.Exists(uiFolder))
                {
                    _webView.CoreWebView2.Navigate("https://" + VirtualHostName + "/index.html");
                }
                else
                {
                    // Fallback search in out directory
                    string outFolder = Path.Combine(exeDir, "..", "out");
                    if (Directory.Exists(outFolder))
                    {
                        _webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                            VirtualHostName,
                            Path.GetFullPath(outFolder),
                            CoreWebView2HostResourceAccessKind.Allow
                        );
                        _webView.CoreWebView2.Navigate("https://" + VirtualHostName + "/index.html");
                    }
                    else
                    {
                        _loadingLabel.Text = "لم يتم العثور على مجلد الملفات (ui). يرجى إعادة تثبيت البرنامج.";
                    }
                }
            }

            private void LaunchExternalBrowser(string url)
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = url,
                        UseShellExecute = true
                    });
                }
                catch (Exception ex)
                {
                    Debug.WriteLine("Failed to launch URL: " + ex.Message);
                }
            }

            private void PromptInstallWebView2()
            {
                var result = MessageBox.Show(
                    "يتطلب برنامج الهنجر حزمة Microsoft Edge WebView2 للعمل.\nهل ترغب في تحميل وتثبيت الحزمة الآن من موقع مايكروسوفت الرسمي؟",
                    "مكون مطلوب",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information
                );

                if (result == DialogResult.Yes)
                {
                    LaunchExternalBrowser("https://go.microsoft.com/fwlink/p/?LinkId=2124703");
                }
                Close();
            }

            private async void CheckForUpdates()
            {
                try
                {
                    using (System.Net.WebClient client = new System.Net.WebClient())
                    {
                        client.Headers.Add("User-Agent", "TheHangar-App");
                        string json = await client.DownloadStringTaskAsync(new Uri(UpdateCheckUrl));

                        string remoteVer = ExtractJsonValue(json, "version");
                        string downloadUrl = ExtractJsonValue(json, "downloadUrl");
                        string notes = ExtractJsonValue(json, "releaseNotes");

                        if (!string.IsNullOrEmpty(remoteVer) && !string.IsNullOrEmpty(downloadUrl))
                        {
                            Version localV = new Version(AppVersion);
                            Version remoteV = new Version(remoteVer);

                            if (remoteV > localV)
                            {
                                string msg = "يتوفر إصدار جديد من الهنجر (v" + remoteVer + ")!\n\n" +
                                             (string.IsNullOrEmpty(notes) ? "" : "الجديد في هذا التحديث:\n" + notes + "\n\n") +
                                             "هل ترغب في تنزيل وتثبيت التحديث الآن؟";

                                DialogResult res = MessageBox.Show(
                                    msg,
                                    "تحديث جديد متاح ✦",
                                    MessageBoxButtons.YesNo,
                                    MessageBoxIcon.Information
                                );

                                if (res == DialogResult.Yes)
                                {
                                    DownloadAndApplyUpdate(downloadUrl);
                                }
                            }
                        }
                    }
                }
                catch { /* Offline or GitHub repo not yet published - silent ignore */ }
            }

            private async void DownloadAndApplyUpdate(string downloadUrl)
            {
                try
                {
                    string tempSetup = Path.Combine(Path.GetTempPath(), "The_Hangar_Update.exe");
                    using (System.Net.WebClient client = new System.Net.WebClient())
                    {
                        await client.DownloadFileTaskAsync(new Uri(downloadUrl), tempSetup);
                    }

                    if (File.Exists(tempSetup))
                    {
                        ProcessStartInfo psi = new ProcessStartInfo
                        {
                            FileName = tempSetup,
                            Arguments = "/UPDATE",
                            UseShellExecute = true
                        };
                        Process.Start(psi);
                        Application.Exit();
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("تعذر إتمام التحديث تلقائياً:\n" + ex.Message, "خطأ في التحديث", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            }

            private string ExtractJsonValue(string json, string key)
            {
                try
                {
                    string pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";
                    System.Text.RegularExpressions.Match match = System.Text.RegularExpressions.Regex.Match(json, pattern);
                    if (match.Success) return match.Groups[1].Value;
                }
                catch { }
                return null;
            }
        }
    }
}

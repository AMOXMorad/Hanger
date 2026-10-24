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
        public const string AppVersion = "1.1.1";
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
                System.Net.ServicePointManager.SecurityProtocol = (System.Net.SecurityProtocolType)3072 | (System.Net.SecurityProtocolType)768 | System.Net.SecurityProtocolType.Tls;
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
                    System.Net.ServicePointManager.SecurityProtocol = (System.Net.SecurityProtocolType)3072 | (System.Net.SecurityProtocolType)768 | System.Net.SecurityProtocolType.Tls;
                    using (System.Net.WebClient client = new System.Net.WebClient())
                    {
                        client.Encoding = System.Text.Encoding.UTF8;
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
                                using (UpdateDialog dlg = new UpdateDialog(AppVersion, remoteVer, notes, downloadUrl))
                                {
                                    dlg.ShowDialog(this);
                                }
                            }
                        }
                    }
                }
                catch { /* Offline or GitHub repo not yet published - silent ignore */ }
            }

            private static string ExtractJsonValue(string json, string key)
            {
                try
                {
                    string pattern = "\"" + key + "\"\\s*:\\s*\"((?:\\\\\"|[^\"])*)\"";
                    System.Text.RegularExpressions.Match match = System.Text.RegularExpressions.Regex.Match(json, pattern);
                    if (match.Success)
                    {
                        string val = match.Groups[1].Value;
                        val = System.Text.RegularExpressions.Regex.Unescape(val);
                        return val;
                    }
                }
                catch { }
                return null;
            }
        }

        public class StyledProgressBar : Panel
        {
            private int _val = 0;
            public int Value
            {
                get { return _val; }
                set { _val = Math.Min(100, Math.Max(0, value)); Invalidate(); }
            }

            public StyledProgressBar()
            {
                DoubleBuffered = true;
                BackColor = ColorTranslator.FromHtml("#16252d");
            }

            protected override void OnPaint(PaintEventArgs e)
            {
                base.OnPaint(e);
                if (_val > 0)
                {
                    int w = (int)(((double)_val / 100.0) * ClientSize.Width);
                    using (Brush b = new SolidBrush(ColorTranslator.FromHtml("#f4b844")))
                    {
                        e.Graphics.FillRectangle(b, 0, 0, w, ClientSize.Height);
                    }
                }
                using (Pen p = new Pen(ColorTranslator.FromHtml("#2c424f"), 1))
                {
                    e.Graphics.DrawRectangle(p, 0, 0, ClientSize.Width - 1, ClientSize.Height - 1);
                }
            }
        }

        public class UpdateDialog : Form
        {
            [DllImport("user32.dll")]
            private static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);
            [DllImport("user32.dll")]
            private static extern bool ReleaseCapture();

            private string _localVer;
            private string _remoteVer;
            private string _notes;
            private string _downloadUrl;
            private System.Net.WebClient _downloadClient;

            protected override CreateParams CreateParams
            {
                get
                {
                    const int CS_DROPSHADOW = 0x20000;
                    CreateParams cp = base.CreateParams;
                    cp.ClassStyle |= CS_DROPSHADOW;
                    return cp;
                }
            }

            public UpdateDialog(string localVer, string remoteVer, string notes, string downloadUrl)
            {
                _localVer = localVer;
                _remoteVer = remoteVer;
                _notes = notes;
                _downloadUrl = downloadUrl;

                InitializeCustomDialog();
            }

            private void InitializeCustomDialog()
            {
                FormBorderStyle = FormBorderStyle.None;
                StartPosition = FormStartPosition.CenterScreen;
                Size = new Size(540, 410);
                BackColor = ColorTranslator.FromHtml("#14232a");
                ForeColor = Color.White;
                KeyPreview = true;
                RightToLeft = RightToLeft.Yes;
                RightToLeftLayout = false;
                ShowInTaskbar = false;

                KeyDown += (s, e) =>
                {
                    if (e.KeyCode == Keys.Escape)
                    {
                        CancelDownloadAndClose();
                    }
                };

                // Top Drag Bar
                Panel pnlHeader = new Panel
                {
                    Dock = DockStyle.Top,
                    Height = 44,
                    BackColor = ColorTranslator.FromHtml("#14232a")
                };
                pnlHeader.MouseDown += DragBar_MouseDown;

                Button btnClose = new Button
                {
                    Text = "✕",
                    Font = new Font("Segoe UI", 10.5f, FontStyle.Bold),
                    ForeColor = ColorTranslator.FromHtml("#94a3b8"),
                    BackColor = Color.Transparent,
                    FlatStyle = FlatStyle.Flat,
                    Size = new Size(36, 32),
                    Location = new Point(10, 6),
                    Cursor = Cursors.Hand
                };
                btnClose.FlatAppearance.BorderSize = 0;
                btnClose.FlatAppearance.MouseOverBackColor = ColorTranslator.FromHtml("#e11d48");
                btnClose.MouseEnter += (s, e) => btnClose.ForeColor = Color.White;
                btnClose.MouseLeave += (s, e) => btnClose.ForeColor = ColorTranslator.FromHtml("#94a3b8");
                btnClose.Click += (s, e) => CancelDownloadAndClose();
                pnlHeader.Controls.Add(btnClose);

                Label lblBrand = new Label
                {
                    Text = "✦ الهنجر · تحديث جديد متاح",
                    Font = new Font("Segoe UI", 10.5f, FontStyle.Bold),
                    ForeColor = ColorTranslator.FromHtml("#f4b844"),
                    Location = new Point(310, 11),
                    AutoSize = true
                };
                lblBrand.MouseDown += DragBar_MouseDown;
                pnlHeader.Controls.Add(lblBrand);
                Controls.Add(pnlHeader);

                // Title Label
                Label lblTitle = new Label
                {
                    Text = "يتوفر إصدار جديد من الهنجر (v" + _remoteVer + ") 🚀",
                    Font = new Font("Segoe UI", 13.5f, FontStyle.Bold),
                    ForeColor = Color.White,
                    Location = new Point(24, 52),
                    Size = new Size(492, 32),
                    TextAlign = ContentAlignment.MiddleRight
                };
                Controls.Add(lblTitle);

                // Subtitle
                Label lblSubtitle = new Label
                {
                    Text = "إصدارك المثبت: v" + _localVer + "  ←  الإصدار الجديد: v" + _remoteVer,
                    Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
                    ForeColor = ColorTranslator.FromHtml("#94a3b8"),
                    Location = new Point(24, 86),
                    Size = new Size(492, 22),
                    TextAlign = ContentAlignment.MiddleRight
                };
                Controls.Add(lblSubtitle);

                // Release Notes Card
                Panel pnlNotes = new Panel
                {
                    Location = new Point(24, 116),
                    Size = new Size(492, 160),
                    BackColor = ColorTranslator.FromHtml("#0e181d"),
                    Padding = new Padding(12)
                };

                TextBox txtNotes = new TextBox
                {
                    Dock = DockStyle.Fill,
                    Multiline = true,
                    ReadOnly = true,
                    BorderStyle = BorderStyle.None,
                    BackColor = ColorTranslator.FromHtml("#0e181d"),
                    ForeColor = ColorTranslator.FromHtml("#e2e8f0"),
                    Font = new Font("Segoe UI", 10f, FontStyle.Regular),
                    RightToLeft = RightToLeft.Yes,
                    ScrollBars = ScrollBars.Vertical,
                    Text = string.IsNullOrEmpty(_notes) ? "تحسينات عامة في الأداء وإضافة مزايا وأدوات جديدة." : _notes
                };
                pnlNotes.Controls.Add(txtNotes);
                Controls.Add(pnlNotes);

                // Bottom Actions Panel
                Panel pnlActions = new Panel
                {
                    Location = new Point(24, 288),
                    Size = new Size(492, 105),
                    BackColor = Color.Transparent
                };

                Button btnUpdate = new Button
                {
                    Text = "تحديث وتثبيت الآن 🚀",
                    Font = new Font("Segoe UI", 10.5f, FontStyle.Bold),
                    BackColor = ColorTranslator.FromHtml("#f4b844"),
                    ForeColor = ColorTranslator.FromHtml("#14232a"),
                    FlatStyle = FlatStyle.Flat,
                    Size = new Size(185, 42),
                    Location = new Point(307, 18),
                    Cursor = Cursors.Hand
                };
                btnUpdate.FlatAppearance.BorderSize = 0;
                btnUpdate.FlatAppearance.MouseOverBackColor = ColorTranslator.FromHtml("#ffc857");

                Button btnLater = new Button
                {
                    Text = "تذكيري لاحقاً",
                    Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
                    BackColor = ColorTranslator.FromHtml("#1e2f38"),
                    ForeColor = ColorTranslator.FromHtml("#cbd5e1"),
                    FlatStyle = FlatStyle.Flat,
                    Size = new Size(130, 42),
                    Location = new Point(165, 18),
                    Cursor = Cursors.Hand
                };
                btnLater.FlatAppearance.BorderColor = ColorTranslator.FromHtml("#334652");
                btnLater.FlatAppearance.BorderSize = 1;
                btnLater.FlatAppearance.MouseOverBackColor = ColorTranslator.FromHtml("#283e4a");
                btnLater.Click += (s, e) => Close();

                // Progress Controls (hidden initially)
                Label lblProgress = new Label
                {
                    Location = new Point(0, 10),
                    Size = new Size(492, 24),
                    Font = new Font("Segoe UI", 10f, FontStyle.Bold),
                    ForeColor = ColorTranslator.FromHtml("#f4b844"),
                    TextAlign = ContentAlignment.MiddleRight,
                    Visible = false,
                    Text = "جاري تنزيل التحديث... 0%"
                };

                StyledProgressBar prgBar = new StyledProgressBar
                {
                    Location = new Point(0, 38),
                    Size = new Size(492, 12),
                    Visible = false
                };

                Label lblDetails = new Label
                {
                    Location = new Point(0, 56),
                    Size = new Size(492, 22),
                    Font = new Font("Segoe UI", 9f, FontStyle.Regular),
                    ForeColor = ColorTranslator.FromHtml("#94a3b8"),
                    TextAlign = ContentAlignment.MiddleRight,
                    Visible = false,
                    Text = ""
                };

                btnUpdate.Click += (s, e) =>
                {
                    btnUpdate.Visible = false;
                    btnLater.Visible = false;
                    lblProgress.Visible = true;
                    prgBar.Visible = true;
                    lblDetails.Visible = true;

                    StartDownload(lblProgress, prgBar, lblDetails, btnLater);
                };

                pnlActions.Controls.Add(btnUpdate);
                pnlActions.Controls.Add(btnLater);
                pnlActions.Controls.Add(lblProgress);
                pnlActions.Controls.Add(prgBar);
                pnlActions.Controls.Add(lblDetails);
                Controls.Add(pnlActions);
            }

            private void DragBar_MouseDown(object sender, MouseEventArgs e)
            {
                if (e.Button == MouseButtons.Left)
                {
                    ReleaseCapture();
                    SendMessage(Handle, 0xA1, 2, 0);
                }
            }

            private void CancelDownloadAndClose()
            {
                if (_downloadClient != null)
                {
                    try { _downloadClient.CancelAsync(); } catch { }
                }
                Close();
            }

            private void StartDownload(Label lblProgress, StyledProgressBar prgBar, Label lblDetails, Button btnLater)
            {
                try
                {
                    string tempSetup = Path.Combine(Path.GetTempPath(), "The_Hangar_Update.exe");
                    if (File.Exists(tempSetup))
                    {
                        try { File.Delete(tempSetup); } catch { }
                    }

                    _downloadClient = new System.Net.WebClient();
                    _downloadClient.Headers.Add("User-Agent", "TheHangar-App");

                    _downloadClient.DownloadProgressChanged += (s, e) =>
                    {
                        prgBar.Value = e.ProgressPercentage;
                        double mbRcv = (double)e.BytesReceived / (1024.0 * 1024.0);
                        double mbTotal = (double)e.TotalBytesToReceive / (1024.0 * 1024.0);
                        lblProgress.Text = string.Format("جاري تنزيل التحديث... {0}%", e.ProgressPercentage);
                        if (mbTotal > 0)
                        {
                            lblDetails.Text = string.Format("{0:F1} MB / {1:F1} MB", mbRcv, mbTotal);
                        }
                        else
                        {
                            lblDetails.Text = string.Format("{0:F1} MB", mbRcv);
                        }
                    };

                    _downloadClient.DownloadFileCompleted += (s, e) =>
                    {
                        if (e.Cancelled)
                        {
                            lblProgress.ForeColor = ColorTranslator.FromHtml("#ef4444");
                            lblProgress.Text = "تم إلغاء التنزيل.";
                            btnLater.Text = "إغلاق";
                            btnLater.Visible = true;
                        }
                        else if (e.Error != null)
                        {
                            lblProgress.ForeColor = ColorTranslator.FromHtml("#ef4444");
                            lblProgress.Text = "تعذر تنزيل التحديث: " + e.Error.Message;
                            btnLater.Text = "إغلاق";
                            btnLater.Visible = true;
                        }
                        else
                        {
                            prgBar.Value = 100;
                            lblProgress.ForeColor = ColorTranslator.FromHtml("#22c55e");
                            lblProgress.Text = "اكتمل التنزيل بنجاح! جاري تثبيت التحديث...";
                            lblDetails.Text = "سيتم إعادة تشغيل الهنجر تلقائياً فور اكتمال التثبيت.";

                            System.Threading.Tasks.Task.Delay(1200).ContinueWith(delegate
                            {
                                try
                                {
                                    string currentDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\');
                                    ProcessStartInfo psi = new ProcessStartInfo
                                    {
                                        FileName = tempSetup,
                                        Arguments = "/UPDATE \"" + currentDir + "\"",
                                        UseShellExecute = true
                                    };
                                    Process.Start(psi);
                                    Application.Exit();
                                }
                                catch (Exception ex)
                                {
                                    Invoke(new Action(delegate
                                    {
                                        lblProgress.ForeColor = ColorTranslator.FromHtml("#ef4444");
                                        lblProgress.Text = "فشل تشغيل المثبت: " + ex.Message;
                                    }));
                                }
                            });
                        }
                    };

                    _downloadClient.DownloadFileAsync(new Uri(_downloadUrl), tempSetup);
                }
                catch (Exception ex)
                {
                    lblProgress.ForeColor = ColorTranslator.FromHtml("#ef4444");
                    lblProgress.Text = "خطأ في بدء التنزيل: " + ex.Message;
                    btnLater.Text = "إغلاق";
                    btnLater.Visible = true;
                }
            }

            protected override void OnPaint(PaintEventArgs e)
            {
                base.OnPaint(e);
                using (Pen borderPen = new Pen(ColorTranslator.FromHtml("#f4b844"), 2))
                {
                    e.Graphics.DrawRectangle(borderPen, 1, 1, ClientSize.Width - 2, ClientSize.Height - 2);
                }
            }
        }
    }
}

using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;
using Microsoft.Win32;

namespace TheHangar
{
    static class SetupProgram
    {
        [STAThread]
        static void Main(string[] args)
        {
            if (args != null && args.Length > 0)
            {
                string arg = args[0].ToUpperInvariant();
                if (arg == "/UPDATE" || arg == "/SILENT")
                {
                    PerformSilentUpdate();
                    return;
                }
            }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupForm());
        }

        private static void PerformSilentUpdate()
        {
            try
            {
                // Kill running instances of The Hangar to release file locks
                System.Threading.Thread.Sleep(500);
                foreach (Process p in Process.GetProcessesByName("The Hangar"))
                {
                    try { p.Kill(); p.WaitForExit(3000); } catch { }
                }

                string targetDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Programs",
                    "The Hangar"
                );
                Directory.CreateDirectory(targetDir);

                Assembly asm = Assembly.GetExecutingAssembly();
                using (Stream resStream = asm.GetManifestResourceStream("Payload.zip"))
                {
                    if (resStream != null)
                    {
                        using (ZipArchive archive = new ZipArchive(resStream, ZipArchiveMode.Read))
                        {
                            foreach (ZipArchiveEntry entry in archive.Entries)
                            {
                                string destPath = Path.Combine(targetDir, entry.FullName);
                                if (string.IsNullOrEmpty(entry.Name))
                                {
                                    Directory.CreateDirectory(destPath);
                                }
                                else
                                {
                                    string dir = Path.GetDirectoryName(destPath);
                                    if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
                                    entry.ExtractToFile(destPath, true);
                                }
                            }
                        }
                    }
                }

                // Relaunch the new updated version
                string exePath = Path.Combine(targetDir, "The Hangar.exe");
                if (File.Exists(exePath))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = exePath,
                        WorkingDirectory = targetDir
                    });
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Silent update failed: " + ex.Message);
            }
        }
    }

    public class SetupForm : Form
    {
        private TextBox _txtPath;
        private Button _btnBrowse;
        private CheckBox _chkDesktop;
        private CheckBox _chkStartMenu;
        private CheckBox _chkLaunch;
        private Button _btnInstall;
        private Button _btnCancel;
        private ProgressBar _progressBar;
        private Label _lblStatus;
        private BackgroundWorker _worker;

        public SetupForm()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            Text = "تثبيت الهنجر — The Hangar Setup";
            Width = 620;
            Height = 460;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            RightToLeft = RightToLeft.Yes;
            RightToLeftLayout = true;
            BackColor = ColorTranslator.FromHtml("#f6f5f0");
            Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            // Header Banner
            Panel pnlHeader = new Panel
            {
                Dock = DockStyle.Top,
                Height = 90,
                BackColor = ColorTranslator.FromHtml("#14232a")
            };

            Label lblTitle = new Label
            {
                Text = "الهنجر · The Hangar",
                Font = new Font("Segoe UI", 16, FontStyle.Bold),
                ForeColor = ColorTranslator.FromHtml("#f4b844"),
                Location = new Point(24, 18),
                AutoSize = true
            };

            Label lblSubtitle = new Label
            {
                Text = "ورشتك الرقمية — من الفكرة للإنجاز",
                Font = new Font("Segoe UI", 10, FontStyle.Regular),
                ForeColor = ColorTranslator.FromHtml("#b7bfba"),
                Location = new Point(26, 52),
                AutoSize = true
            };

            pnlHeader.Controls.Add(lblTitle);
            pnlHeader.Controls.Add(lblSubtitle);
            Controls.Add(pnlHeader);

            // Body Container
            Panel pnlBody = new Panel
            {
                Dock = DockStyle.Fill,
                Padding = new Padding(25, 110, 25, 20)
            };

            Label lblPathTitle = new Label
            {
                Text = "مسار التثبيت:",
                Location = new Point(25, 105),
                AutoSize = true,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold)
            };
            Controls.Add(lblPathTitle);

            string defaultPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "Programs",
                "The Hangar"
            );

            _txtPath = new TextBox
            {
                Text = defaultPath,
                Location = new Point(135, 132),
                Width = 430,
                RightToLeft = RightToLeft.No
            };
            Controls.Add(_txtPath);

            _btnBrowse = new Button
            {
                Text = "تغيير...",
                Location = new Point(25, 130),
                Width = 95,
                Height = 28,
                Cursor = Cursors.Hand
            };
            _btnBrowse.Click += (s, e) =>
            {
                using (FolderBrowserDialog fbd = new FolderBrowserDialog())
                {
                    fbd.SelectedPath = _txtPath.Text;
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        _txtPath.Text = Path.Combine(fbd.SelectedPath, "The Hangar");
                    }
                }
            };
            Controls.Add(_btnBrowse);

            // Checkboxes
            _chkDesktop = new CheckBox
            {
                Text = "إنشاء اختصار على سطح المكتب",
                Checked = true,
                Location = new Point(25, 180),
                AutoSize = true
            };
            Controls.Add(_chkDesktop);

            _chkStartMenu = new CheckBox
            {
                Text = "إضافة اختصار إلى قائمة ابدأ (Start Menu)",
                Checked = true,
                Location = new Point(25, 212),
                AutoSize = true
            };
            Controls.Add(_chkStartMenu);

            _chkLaunch = new CheckBox
            {
                Text = "تشغيل برنامج الهنجر فور اكتمال التثبيت",
                Checked = true,
                Location = new Point(25, 244),
                AutoSize = true
            };
            Controls.Add(_chkLaunch);

            // Progress Bar & Status
            _progressBar = new ProgressBar
            {
                Location = new Point(25, 290),
                Width = 550,
                Height = 22,
                Visible = false
            };
            Controls.Add(_progressBar);

            _lblStatus = new Label
            {
                Location = new Point(25, 318),
                Width = 550,
                Height = 25,
                ForeColor = ColorTranslator.FromHtml("#62706c"),
                Text = ""
            };
            Controls.Add(_lblStatus);

            // Bottom Buttons
            Panel pnlBottom = new Panel
            {
                Dock = DockStyle.Bottom,
                Height = 65,
                BackColor = ColorTranslator.FromHtml("#edf0eb")
            };

            _btnInstall = new Button
            {
                Text = "تثبيت الآن",
                Width = 130,
                Height = 36,
                Location = new Point(25, 14),
                BackColor = ColorTranslator.FromHtml("#f4b844"),
                ForeColor = ColorTranslator.FromHtml("#14232a"),
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 10, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            _btnInstall.FlatAppearance.BorderSize = 0;
            _btnInstall.Click += BtnInstall_Click;

            _btnCancel = new Button
            {
                Text = "إلغاء",
                Width = 95,
                Height = 36,
                Location = new Point(168, 14),
                BackColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            _btnCancel.FlatAppearance.BorderColor = ColorTranslator.FromHtml("#cad1c9");
            _btnCancel.Click += (s, e) => Close();

            pnlBottom.Controls.Add(_btnInstall);
            pnlBottom.Controls.Add(_btnCancel);
            Controls.Add(pnlBottom);

            // Worker setup
            _worker = new BackgroundWorker
            {
                WorkerReportsProgress = true
            };
            _worker.DoWork += Worker_DoWork;
            _worker.ProgressChanged += (s, e) =>
            {
                _progressBar.Value = Math.Min(100, Math.Max(0, e.ProgressPercentage));
                if (e.UserState != null)
                {
                    _lblStatus.Text = e.UserState.ToString();
                }
            };
            _worker.RunWorkerCompleted += Worker_RunWorkerCompleted;
        }

        private void BtnInstall_Click(object sender, EventArgs e)
        {
            _btnInstall.Enabled = false;
            _btnBrowse.Enabled = false;
            _txtPath.Enabled = false;
            _chkDesktop.Enabled = false;
            _chkStartMenu.Enabled = false;
            _progressBar.Visible = true;
            _lblStatus.Text = "جاري بدء استخراج الملفات...";

            string targetDir = _txtPath.Text.Trim();
            bool makeDesktop = _chkDesktop.Checked;
            bool makeStart = _chkStartMenu.Checked;
            bool launch = _chkLaunch.Checked;

            _worker.RunWorkerAsync(new object[] { targetDir, makeDesktop, makeStart, launch });
        }

        private void Worker_DoWork(object sender, DoWorkEventArgs e)
        {
            object[] args = (object[])e.Argument;
            string targetDir = (string)args[0];
            bool makeDesktop = (bool)args[1];
            bool makeStart = (bool)args[2];
            bool launch = (bool)args[3];

            Directory.CreateDirectory(targetDir);

            // Read embedded resource
            _worker.ReportProgress(15, "قراءة حزمة التثبيت...");
            Assembly asm = Assembly.GetExecutingAssembly();
            using (Stream resStream = asm.GetManifestResourceStream("Payload.zip"))
            {
                if (resStream == null)
                {
                    throw new Exception("لم يتم العثور على ملف الحزمة المدمج داخل المثبت.");
                }

                _worker.ReportProgress(35, "استخراج ملفات البرنامج والواجهة...");
                using (ZipArchive archive = new ZipArchive(resStream, ZipArchiveMode.Read))
                {
                    int total = archive.Entries.Count;
                    int current = 0;

                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        string destPath = Path.Combine(targetDir, entry.FullName);
                        if (string.IsNullOrEmpty(entry.Name))
                        {
                            Directory.CreateDirectory(destPath);
                        }
                        else
                        {
                            string dir = Path.GetDirectoryName(destPath);
                            if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
                            entry.ExtractToFile(destPath, true);
                        }

                        current++;
                        int pct = 35 + (int)(((double)current / total) * 45);
                        _worker.ReportProgress(pct, "استخراج: " + entry.Name);
                    }
                }
            }

            // Create shortcuts
            string exePath = Path.Combine(targetDir, "The Hangar.exe");
            string icoPath = Path.Combine(targetDir, "TheHangar.ico");

            _worker.ReportProgress(85, "تجهيز الاختصارات في ويندوز...");
            if (makeDesktop)
            {
                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                CreateShortcut(Path.Combine(desktop, "الهنجر.lnk"), exePath, targetDir, icoPath);
            }

            if (makeStart)
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string startDir = Path.Combine(appData, @"Microsoft\Windows\Start Menu\Programs");
                Directory.CreateDirectory(startDir);
                CreateShortcut(Path.Combine(startDir, "الهنجر.lnk"), exePath, targetDir, icoPath);
            }

            // Register in Windows Uninstall
            _worker.ReportProgress(95, "تسجيل البرنامج في لوحة التحكم...");
            RegisterUninstall(targetDir, exePath, icoPath);

            _worker.ReportProgress(100, "اكتمل التثبيت بنجاح!");
            e.Result = new object[] { targetDir, exePath, launch };
        }

        private void Worker_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {
            if (e.Error != null)
            {
                MessageBox.Show(
                    "حدث خطأ أثناء التثبيت:\n" + e.Error.Message,
                    "خطأ في التثبيت",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                _btnInstall.Enabled = true;
                _btnCancel.Text = "إغلاق";
                return;
            }

            object[] res = (object[])e.Result;
            string targetDir = (string)res[0];
            string exePath = (string)res[1];
            bool launch = (bool)res[2];

            MessageBox.Show(
                "تم تثبيت برنامج الهنجر بنجاح على جهازك!\nالمسار: " + targetDir,
                "اكتمل التثبيت بنجاح",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information
            );

            if (launch && File.Exists(exePath))
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = exePath,
                        WorkingDirectory = targetDir
                    });
                }
                catch { }
            }

            Close();
        }

        private void CreateShortcut(string shortcutPath, string targetPath, string workingDir, string iconPath)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType == null) return;

                object shell = Activator.CreateInstance(shellType);
                object shortcut = shellType.InvokeMember(
                    "CreateShortcut",
                    BindingFlags.InvokeMethod,
                    null,
                    shell,
                    new object[] { shortcutPath }
                );

                Type scType = shortcut.GetType();
                scType.InvokeMember("TargetPath", BindingFlags.SetProperty, null, shortcut, new object[] { targetPath });
                scType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty, null, shortcut, new object[] { workingDir });
                if (File.Exists(iconPath))
                {
                    scType.InvokeMember("IconLocation", BindingFlags.SetProperty, null, shortcut, new object[] { iconPath + ",0" });
                }
                scType.InvokeMember("Description", BindingFlags.SetProperty, null, shortcut, new object[] { "الهنجر — ورشتك الرقمية" });
                scType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
            }
            catch { }
        }

        private void RegisterUninstall(string installDir, string exePath, string icoPath)
        {
            try
            {
                using (RegistryKey parent = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall"))
                {
                    if (parent == null) return;
                    using (RegistryKey appKey = parent.CreateSubKey("TheHangar"))
                    {
                        if (appKey == null) return;
                        appKey.SetValue("DisplayName", "الهنجر — The Hangar");
                        appKey.SetValue("DisplayVersion", "1.0.0");
                        appKey.SetValue("Publisher", "Morad (AMOX)");
                        appKey.SetValue("DisplayIcon", icoPath);
                        appKey.SetValue("InstallLocation", installDir);
                        string uninstExe = Path.Combine(installDir, "Uninstall.exe");
                        appKey.SetValue("UninstallString", "\"" + uninstExe + "\"");
                        appKey.SetValue("NoModify", 1, RegistryValueKind.DWord);
                        appKey.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                    }
                }
            }
            catch { }
        }
    }
}

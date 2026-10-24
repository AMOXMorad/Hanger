using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using Microsoft.Win32;

namespace TheHangar
{
    static class Uninstaller
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            var confirm = MessageBox.Show(
                "هل أنت متأكد من رغبتك في إزالة برنامج الهنجر (The Hangar) بالكامل من جهازك؟",
                "إلغاء التثبيت",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question,
                MessageBoxDefaultButton.Button2
            );

            if (confirm != DialogResult.Yes) return;

            try
            {
                // 1. Remove Desktop shortcuts
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string[] desktopShortcuts = {
                    Path.Combine(desktopPath, "\u0627\u0644\u0647\u0646\u062c\u0631.lnk"),
                    Path.Combine(desktopPath, "The Hangar.lnk")
                };
                foreach (string sc in desktopShortcuts)
                {
                    if (File.Exists(sc)) { try { File.Delete(sc); } catch { } }
                }

                // 2. Remove Start Menu shortcuts & folder
                string programs = Environment.GetFolderPath(Environment.SpecialFolder.Programs);
                if (string.IsNullOrEmpty(programs))
                {
                    programs = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), @"Microsoft\Windows\Start Menu\Programs");
                }
                string[] startShortcuts = {
                    Path.Combine(programs, "\u0627\u0644\u0647\u0646\u062c\u0631.lnk"),
                    Path.Combine(programs, "The Hangar.lnk")
                };
                foreach (string sc in startShortcuts)
                {
                    if (File.Exists(sc)) { try { File.Delete(sc); } catch { } }
                }

                string startFolder = Path.Combine(programs, "\u0627\u0644\u0647\u0646\u062c\u0631");
                if (Directory.Exists(startFolder))
                {
                    try { Directory.Delete(startFolder, true); } catch { }
                }

                // 3. Remove Registry entry
                try
                {
                    using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall", true))
                    {
                        if (key != null)
                        {
                            key.DeleteSubKeyTree("TheHangar", false);
                        }
                    }
                }
                catch { }

                // 4. Remove installation folder via self-deleting command
                string installDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\');
                string cmd = "/C timeout /t 2 /nobreak > NUL & rmdir /s /q \"" + installDir + "\"";

                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = cmd,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                Process.Start(psi);

                MessageBox.Show(
                    "تم إلغاء تثبيت برنامج الهنجر بنجاح.",
                    "اكتملت الإزالة",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "حدث خطأ أثناء إلغاء التثبيت: " + ex.Message,
                    "خطأ",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}

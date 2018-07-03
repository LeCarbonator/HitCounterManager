﻿//MIT License

//Copyright(c) 2016-2018 Peter Kirmeier

//Permission Is hereby granted, free Of charge, to any person obtaining a copy
//of this software And associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, And/Or sell
//copies of the Software, And to permit persons to whom the Software Is
//furnished to do so, subject to the following conditions:

//The above copyright notice And this permission notice shall be included In all
//copies Or substantial portions of the Software.

//THE SOFTWARE Is PROVIDED "AS IS", WITHOUT WARRANTY Of ANY KIND, EXPRESS Or
//IMPLIED, INCLUDING BUT Not LIMITED To THE WARRANTIES Of MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE And NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS Or COPYRIGHT HOLDERS BE LIABLE For ANY CLAIM, DAMAGES Or OTHER
//LIABILITY, WHETHER In AN ACTION Of CONTRACT, TORT Or OTHERWISE, ARISING FROM,
//OUT OF Or IN CONNECTION WITH THE SOFTWARE Or THE USE Or OTHER DEALINGS IN THE
//SOFTWARE.

using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace HitCounterManager
{
    public partial class Settings : Form
    {
        private const int MAPVK_VK_TO_VSC = 0;

        [DllImport("User32.dll", CharSet = CharSet.Unicode)]
        private static extern int GetKeyNameTextW(long lParam, string lpBuffer, int nSize);

        [DllImport("User32.dll")]
        private static extern int MapVirtualKey(int uCode, int uMapType);

        private Shortcuts sc;
        private OutModule om = null;

        #region Form

        public Settings()
        {
            InitializeComponent();
        }

        private void Settings_Load(object sender, EventArgs e)
        {
            sc = ((Form1)Owner).sc;
            om = ((Form1)Owner).om;

            ShortcutsKey key;
            key = sc.Key_Get(Shortcuts.SC_Type.SC_Type_Reset);
            cbScReset.Checked = key.used;
            if (key.valid) UpdateKeyName(txtReset, key.key);
            key = sc.Key_Get(Shortcuts.SC_Type.SC_Type_Hit);
            cbScHit.Checked = key.used;
            if (key.valid) UpdateKeyName(txtHit, key.key);
            key = sc.Key_Get(Shortcuts.SC_Type.SC_Type_Split);
            cbScNextSplit.Checked = key.used;
            if (key.valid) UpdateKeyName(txtNextSplit, key.key);

            txtInput.Text = om.FilePathIn;
            txtOutput.Text = om.FilePathOut;

            radioHotKeyMethod_sync.Checked = (sc.NextStart_Method == Shortcuts.SC_HotKeyMethod.SC_HotKeyMethod_Sync);
            radioHotKeyMethod_async.Checked = (sc.NextStart_Method == Shortcuts.SC_HotKeyMethod.SC_HotKeyMethod_Async);

            cbShowAttempts.Checked = om.ShowAttemptsCounter;
            cbShowHeadline.Checked = om.ShowHeadline;
            cbShowSessionProgress.Checked = om.ShowSessionProgress;
            numShowSplitsCountFinished.Value = om.ShowSplitsCountFinished;
            numShowSplitsCountUpcoming.Value = om.ShowSplitsCountUpcoming;
            cbApCustomCss.Checked = om.StyleUseCustom;
            txtCssUrl.Text = om.StyleCssUrl;
            txtFontUrl.Text = om.StyleFontUrl;
            numStyleDesiredWidth.Value = om.StyleDesiredWidth;
            cbApHighContrast.Checked = om.StyleUseHighContrast;
        }

        #endregion
        #region Functions

        private string GetNameFromKeyCode(Keys keyCode)
        {
            if (keyCode == Keys.None) return "None";
            
            long lParam = MapVirtualKey((int)keyCode, MAPVK_VK_TO_VSC) << 16;
            string lpString = new string('\0', 256);

            if (0 == GetKeyNameTextW(lParam, lpString, lpString.Length)) return "?";

            return lpString;
        }

        private void UpdateKeyName(TextBox txt, KeyEventArgs e)
        {
            txt.Text = "";
            if (e.Alt) txt.Text += "ALT + ";
            if (e.Control) txt.Text += "CTRL + ";
            if (e.Shift) txt.Text += "SHIFT + ";
            txt.Text += GetNameFromKeyCode(e.KeyCode);
        }

        private void RegisterHotKey(TextBox txt, CheckBox cb, Shortcuts.SC_Type Id, KeyEventArgs e)
        {
            ShortcutsKey key = new ShortcutsKey();

            if (e.KeyCode == Keys.ShiftKey) return;
            if (e.KeyCode == Keys.ControlKey) return;
            if (e.KeyCode == Keys.Alt) return;
            if (e.KeyCode == Keys.Menu) return; // = Alt

            // register hotkey
            key.key = e;
            sc.Key_Set(Id, key);

            UpdateKeyName(txt, e);
        }

        private void ApplyAppearance(object sender, EventArgs e)
        {
            if (null == om) return;

            om.ShowAttemptsCounter = cbShowAttempts.Checked;
            om.ShowHeadline = cbShowHeadline.Checked;
            om.ShowSessionProgress = cbShowSessionProgress.Checked;
            om.ShowSplitsCountFinished = (int)numShowSplitsCountFinished.Value;
            om.ShowSplitsCountUpcoming = (int)numShowSplitsCountUpcoming.Value;
            om.StyleUseHighContrast = cbApHighContrast.Checked;
            om.StyleDesiredWidth = (int)numStyleDesiredWidth.Value;
            om.Update();
        }

        #endregion
        #region UI

        private void txtReset_KeyDown(object sender, KeyEventArgs e)
        {
            RegisterHotKey(txtReset, null, Shortcuts.SC_Type.SC_Type_Reset, e);
            cbScReset.Checked = true;
        }

        private void txtHit_KeyDown(object sender, KeyEventArgs e)
        {
            RegisterHotKey(txtHit, null, Shortcuts.SC_Type.SC_Type_Hit, e);
            cbScHit.Checked = true;
        }

        private void txtNextSplit_KeyDown(object sender, KeyEventArgs e)
        {
            RegisterHotKey(txtNextSplit, null, Shortcuts.SC_Type.SC_Type_Split, e);
            cbScNextSplit.Checked = true;
        }

        private void cbScReset_CheckedChanged(object sender, EventArgs e)
        {
            sc.Key_SetState(Shortcuts.SC_Type.SC_Type_Reset, cbScReset.Checked);
        }

        private void cbScHit_CheckedChanged(object sender, EventArgs e)
        {
            sc.Key_SetState(Shortcuts.SC_Type.SC_Type_Hit, cbScHit.Checked);
        }

        private void cbScNextSplit_CheckedChanged(object sender, EventArgs e)
        {
            sc.Key_SetState(Shortcuts.SC_Type.SC_Type_Split, cbScNextSplit.Checked);
        }

        private void btnInput_Click(object sender, EventArgs e)
        {
            if (File.Exists(txtInput.Text))
            {
                OpenFileDialog1.InitialDirectory = new FileInfo(txtInput.Text).Directory.FullName;
                OpenFileDialog1.FileName = Path.GetFileName(txtInput.Text);
            }
            else
            {
                OpenFileDialog1.InitialDirectory = Environment.CurrentDirectory;
                OpenFileDialog1.FileName = "*.template";
            }

            OpenFileDialog1.Filter = "Templates (*.template)|*.template|All files (*.*)|*.*";
            OpenFileDialog1.FilterIndex = 0;
            if (DialogResult.OK == OpenFileDialog1.ShowDialog(this))
            {
                txtInput.Text = OpenFileDialog1.FileName;
                om.FilePathIn = OpenFileDialog1.FileName;
            }
        }

        private void btnOutput_Click(object sender, EventArgs e)
        {
            if (File.Exists(txtOutput.Text))
            {
                OpenFileDialog1.InitialDirectory = new FileInfo(txtOutput.Text).Directory.FullName;
                OpenFileDialog1.FileName = Path.GetFileName(txtOutput.Text);
            }
            else
            {
                OpenFileDialog1.InitialDirectory = Environment.CurrentDirectory;
                OpenFileDialog1.FileName = "*.html";
            }

            OpenFileDialog1.Filter = "HTML (*.html)|*.html|All files (*.*)|*.*";
            OpenFileDialog1.FilterIndex = 0;
            if (DialogResult.OK == OpenFileDialog1.ShowDialog(this))
            {
                txtOutput.Text = OpenFileDialog1.FileName;
                om.FilePathOut = OpenFileDialog1.FileName;
            }
        }

        private void radioHotKeyMethod_CheckedChanged(object sender, EventArgs e)
        {
            if (null == sc) return; // when invoked during form load

            if (radioHotKeyMethod_sync.Checked)
            {
                if (sc.NextStart_Method != Shortcuts.SC_HotKeyMethod.SC_HotKeyMethod_Sync)
                {
                    sc.NextStart_Method = Shortcuts.SC_HotKeyMethod.SC_HotKeyMethod_Sync;
                    MessageBox.Show("Changes only take effect after restarting the application.", "Restart required", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            else if (radioHotKeyMethod_async.Checked)
            {
                if (sc.NextStart_Method != Shortcuts.SC_HotKeyMethod.SC_HotKeyMethod_Async)
                {
                    sc.NextStart_Method = Shortcuts.SC_HotKeyMethod.SC_HotKeyMethod_Async;
                    MessageBox.Show("Changes only take effect after restarting the application.", "Restart required", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
        }

        private void btnApApply_Click(object sender, EventArgs e)
        {
            om.StyleUseCustom = cbApCustomCss.Checked;
            om.StyleCssUrl = txtCssUrl.Text;
            om.StyleFontUrl = txtFontUrl.Text;
            ApplyAppearance(sender, e);
        }

        private void cbApCustomCss_CheckedChanged(object sender, EventArgs e)
        {
            txtCssUrl.Enabled = cbApCustomCss.Checked;
            txtFontUrl.Enabled = cbApCustomCss.Checked;
        }

        #endregion
    }
}
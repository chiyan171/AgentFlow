---
name: install-agentflow
description: Installs the AgentFlow framework into a new project. Use this when the user asks to "Install AgentFlow", "Setup AgentFlow", or "Initialize AgentFlow". It creates the necessary directory structure, scripts, documentation portal, and agent profiles.
---

# Install AgentFlow

This skill installs the AgentFlow framework into the current directory.

## Usage

Run the following script to install AgentFlow.

### Python Installer (Recommended)

Save this script as `.github/scripts/tmp/install.py` and run it with `python3 .github/scripts/tmp/install.py`.

```python
import os
import urllib.request
import zipfile
import shutil
import sys

# Configuration
REPO_URL = "https://github.com/chiyan171/AgentFlow/archive/refs/heads/master.zip"
TEMP_ZIP = "agentflow.zip"
EXTRACT_DIR = "agentflow_temp"
TEMPLATE_DIR = "AgentFlow-master/template"

def log(msg):
    print(f"✅ {msg}")

def error(msg):
    print(f"❌ {msg}")
    sys.exit(1)

def main():
    print("🚀 开始安装 AgentFlow...")

    # 1. Download
    try:
        log(f"正在下载 AgentFlow 模板: {REPO_URL}")
        urllib.request.urlretrieve(REPO_URL, TEMP_ZIP)
    except Exception as e:
        error(f"下载失败: {e}")

    # 2. Extract
    try:
        log("正在解压...")
        with zipfile.ZipFile(TEMP_ZIP, 'r') as zip_ref:
            zip_ref.extractall(EXTRACT_DIR)
    except Exception as e:
        error(f"解压失败: {e}")

    # 3. Copy template files
    try:
        source = os.path.join(EXTRACT_DIR, TEMPLATE_DIR)
        if not os.path.exists(source):
            error(f"模板目录不存在: {source}")
        
        log("正在复制文件到当前目录...")
        # Copy contents of template to current directory
        # We use shutil.copytree with dirs_exist_ok=True (Python 3.8+)
        # If < 3.8, we need a custom loop. Assuming 3.8+ for modern dev.
        if sys.version_info < (3, 8):
             error("需要 Python 3.8 或更高版本")

        shutil.copytree(source, ".", dirs_exist_ok=True)
        
    except Exception as e:
        error(f"复制文件失败: {e}")

    # 4. Cleanup
    try:
        log("正在清理临时文件...")
        os.remove(TEMP_ZIP)
        shutil.rmtree(EXTRACT_DIR)
    except Exception as e:
        log(f"清理警告 (可忽略): {e}")

    log("AgentFlow 安装完成！")
    print("\n下一步：")
    print("1. 运行 `chmod +x bin/agentflow`")
    print("2. 运行 `bin/agentflow validate .` 验证安装")

if __name__ == "__main__":
    main()
```

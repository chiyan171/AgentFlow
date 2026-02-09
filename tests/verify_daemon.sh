#!/bin/zsh
# tests/verify_daemon.sh
# 验证 AgentFlow Daemon 的核心功能：
# 1. 串行执行
# 2. 并行执行 (BG:)
# 3. 日志反馈

# 设置环境
TEST_DIR="test_sandbox_$(date +%s)"
BUS_DIR="$TEST_DIR/.agentflow/bus"
CMD_PIPE="$BUS_DIR/cmd.q"
LOG_FILE="$BUS_DIR/runner.log"

# 清理函数
cleanup() {
    echo "🧹 清理测试环境..."
    if [[ -f "$BUS_DIR/daemon.pid" ]]; then
        pid=$(cat "$BUS_DIR/daemon.pid")
        kill $pid 2>/dev/null || true
    fi
    rm -rf "$TEST_DIR"
}
trap cleanup EXIT

# 1. 初始化
echo "🚀 [Step 1] 初始化测试环境..."
mkdir -p "$BUS_DIR"
touch "$CMD_PIPE" "$LOG_FILE"

# 2. 启动 Daemon (后台运行)
echo "🚀 [Step 2] 启动 Daemon..."
# 模拟 bin/agentflow daemon 的核心逻辑 (简化版，确保逻辑一致)
# 注意：这里直接引用 bin/agentflow 的 run_daemon 函数太复杂，我们模拟其行为
# 或者更好：直接 source bin/agentflow 并运行 run_daemon
source bin/agentflow

# 在后台启动 daemon
run_daemon "$TEST_DIR" > /dev/null 2>&1 &
DAEMON_PID=$!
echo $DAEMON_PID > "$BUS_DIR/daemon.pid"

# 等待启动
sleep 2

# 3. 测试串行命令
echo "🚀 [Step 3] 测试串行命令..."
echo "echo 'Hello Serial' > $TEST_DIR/serial.txt" >> "$CMD_PIPE"
sleep 1

if grep -q "Hello Serial" "$TEST_DIR/serial.txt"; then
    echo "✅ 串行命令执行成功"
else
    echo "❌ 串行命令执行失败"
    exit 1
fi

if grep -q "✅ 成功" "$LOG_FILE"; then
    echo "✅ 主日志记录成功"
else
    echo "❌ 主日志记录失败"
    cat "$LOG_FILE"
    exit 1
fi

# 4. 测试并行命令 (BG:)
echo "🚀 [Step 4] 测试并行命令..."
# 启动一个耗时任务 (sleep 2)，同时立即检查主日志是否释放
echo "BG: sleep 2 && echo 'Done Parallel' > $TEST_DIR/parallel.txt" >> "$CMD_PIPE"
sleep 0.5

# 此时任务应该在后台运行，serial.txt 应该还不存在
if [[ -f "$TEST_DIR/parallel.txt" ]]; then
    echo "❌ 并行任务未并行 (过早完成)"
    exit 1
fi

# 等待任务完成
sleep 3
if grep -q "Done Parallel" "$TEST_DIR/parallel.txt"; then
    echo "✅ 并行任务执行成功"
else
    echo "❌ 并行任务执行失败"
    exit 1
fi

# 检查是否有独立的 task 日志
task_log=$(ls "$BUS_DIR"/task_*.log 2>/dev/null | head -1)
if [[ -n "$task_log" ]]; then
    echo "✅ 发现独立任务日志: $task_log"
else
    echo "❌ 未发现独立任务日志"
    exit 1
fi

echo "🎉 所有测试通过！架构验证完成。"
exit 0

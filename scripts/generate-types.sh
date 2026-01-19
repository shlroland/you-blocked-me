#!/bin/bash

# 生成类型文件
wrangler types

# 定义目标目录（可以根据需要修改）
TARGET_DIR="src/types"
TARGET_FILE="$TARGET_DIR/worker-configuration.d.ts"

# 创建目标目录（如果不存在）
mkdir -p "$TARGET_DIR"

# 移动文件到目标位置
mv worker-configuration.d.ts "$TARGET_FILE"

echo "✅ 类型文件已生成到: $TARGET_FILE"

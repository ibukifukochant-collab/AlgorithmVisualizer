# 根据Java代码彻底重构递归可视化方案

## 1. 算法层重构

* 完全按照Java代码逻辑重新实现算法

* 使用全局index变量跟踪当前位置

* 实现current和max变量的跟踪

* 模拟Java代码的递归调用过程

* 生成符合Java逻辑的详细步骤

## 2. 可视化器层重构

* 重新设计递归栈显示逻辑

* 实现三格布局：左子节点、当前节点、右子节点

* 添加current和max变量的实时显示

* 实现递归进入/回溯的完整流程

* 添加基础情况判断（纯x、纯xx等不进入下一层）

## 3. 递归流程实现

* 实现递归进入下一层的逻辑（遇到'('时）

* 实现递归回溯的逻辑（遇到')'时）

* 实现选择操作符的最大值判断（遇到'|'时）

* 实现字符处理逻辑（遇到'x'时）

* 实现子节点完成后的父节点更新

## 4. 步骤生成逻辑

* 初始步骤：显示完整表达式

* 分解步骤：将表达式分解为左右两部分

* 递归进入步骤：显示进入下一层

* 基础情况步骤：显示纯x/纯xx不进入下一层

* 选择判断步骤：显示|max(current)计算

* 回溯步骤：显示返回值和更新父节点

## 5. 动画和交互

* 添加步骤切换动画

* 实现递归进入/回溯的视觉反馈

* 完善控制按钮功能

这个重构将完全按照Java代码的逻辑实现可视化，准确展示算法的递归过程。

<br />

import java.util.Scanner;

public class Main {
static int index = -1;
static String line;
public static void main(String\[] args) {
Scanner sc = new Scanner(System.in);
line = sc.nextLine();
System.out.println(dfs());
}
public static int dfs(){
int current = 0;
int max = 0;
while(index < line.length()-1){
index++;
if(line.charAt(index) == '('){
current+=dfs();
}else if(line.charAt(index) == '|'){
max = Math.max(max,current);
current = 0;
}else if(line.charAt(index) == 'x'){
current++;
}else if(line.charAt(index) == ')'){
return Math.max(max,current);
}
}
return Math.max(max,current);
}
}

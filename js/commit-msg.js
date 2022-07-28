const exec = require('child_process').exec;
const chalk = require('chalk'); //粉笔
const fs = require('fs');
const successChalk = chalk.rgb(13, 188, 121); //用于打印绿色log
const failChalk = chalk.rgb(222, 65, 58); //用于打印红色log
//当前git存在merge操作
if(fs.existsSync(`.git/MERGE_HEAD`)) {
  //合并操作的信息 例  
  //合并本地分支  Merge branch 'develop' into hk0608_test
  //合并远程分支  Merge remote-tracking branch 'origin/develop' into hk0608_test
  let msg = fs.readFileSync('.git/MERGE_MSG').toString();
  //判断merge操作是合并develop到某个分支，设置异常退出，阻止合并
  if(msg.match(/Merge.*branch '(origin\/)?(develop|comtest)' into/)) {
    console.log(failChalk('develop与comtest分支不可用于合并操作！！！'));
    console.log(failChalk('使用git merge --abort 或者git reset --merge回到merge前的状态'));
    console.log(failChalk('注意！！！上面的方法会导致当前已经add但未commit的文件丢失，请谨慎处理'));
    process.exit(1);
  } else {
    return;
  }
}
//提交类型
let commitTypeArr = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'other'];
//自定义提交信息
let commitMsg = fs.readFileSync('.git/COMMIT_EDITMSG').toString();
//判断commit信息符合格式 <type>(scope) <explain>
//例  feat(sims) 学生系统新增缴费宫女
//  fix 修复报名订单bug
let matches = commitMsg.match(/(?<type>[^\( ]*)(\((?<scope>[^\)]*)\))?\s+(?<explain>.*)/)
//提交不符合规范
if(!matches) {
  console.log(failChalk('提交信息不符合<type>(scope) explain规范'));
  process.exit(1);
}
let { type, explain } = matches.groups;
//提交type不在规定内
if (!commitTypeArr.includes(type)) {
  console.log(failChalk('提交信息不符合<type>(scope) explain规范'));
  console.log(failChalk(`type：<${type}>不在可用范围内(${commitTypeArr.join('、')})`));
  process.exit(1);
}
//提交信息为空
if (!explain) {
  console.log(failChalk('提交信息不符合<type>(scope) explain规范'));
  console.log(failChalk('explain不能为空'));
  process.exit(1);
}


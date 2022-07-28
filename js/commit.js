const exec = require('child_process').exec;
const chalk = require('chalk'); //粉笔
const fs = require('fs');
const successChalk = chalk.rgb(13,188,121); //用于打印绿色log
const failChalk = chalk.rgb(222,65,58); //用于打印红色log

//merge操作忽略eslint校验
if(fs.existsSync(`.git/MERGE_HEAD`)) return;

let startTime = new Date();
let cmdStr = 'eslint --ext .js,.vue ';
console.log(successChalk('start precommit check'));
// let a = execSync('git status -s');
// console.log(a, typeof a)
let checkFolds = {};
//读取git文件状态，获取未提交文件
exec('git status -s', function(err, stdout, stderr) {
  //本次没有文件变动时，stdout为空，否则返回带状态的文件列表字符串，中间以空格分割，并带有换行符
  //例
  //A  src/components/.../xxx.js
  //D  src/pages/.../xxx.vue
  //?? src/.../xxx.txt
  // console.log(stdout);
  let files = stdout.replace(/\?\?/g,'').replace(/\n/g,' ').split(' '); 
  //files为['A', 'src/components/.../xxx.js', 'D', 'src/pages/.../xxx.vue', '??', 'src/.../xxx.txt']
  // console.log(files);
  for (let file of files) {
    //遍历files，只取.js,.vue结尾的数据做校验
    let matches = file.match(/^src\/([^\/]*)\/([^\/]*)\/.*\.(js|vue)$/);
    //此文件必须位于src目录内
    if(matches) {
      let secFold = matches[1]; //secFold代表src下的第一层匹配到的目录
      //第一层目录为pages，则在具体区分此文件属于pages下的哪个项目（matches[2]）
      if (secFold === 'pages') {
        checkFolds[`src/pages/${matches[2]}`] = 1;
      } else {
        //匹配到修改内容为非pages目录，则直接校验到src下的一级目录（secFold）
        checkFolds[`src/${secFold}`] = 1;
      }
    }
  }
  let params = Object.keys(checkFolds);
  //本次提交不包含src下的文件，不做校验
  if (params.length === 0) {
    console.log(successChalk('this commit does not include src/* files, skip check'));
    console.log(successChalk(`it cost ${Math.floor(new Date().getTime()-startTime)/1000}s`));
  } else {
    cmdStr += params.join(' ');
    // cmdStr += 'src/';
    console.log(successChalk(cmdStr));
    //开始执行eslint校验
    exec(cmdStr, function(cmdErr, cmdStdout, cmdStderr) {
      let endTime = new Date().getTime(); //执行完成时间
      let duration = Math.floor(endTime-startTime)/1000;
      //check到错误，抛出异常
      if(cmdStdout) {
        console.log(failChalk(`precommit check cost ${duration}s`));
        console.log(failChalk(cmdStdout));
        process.exit(1);
      } else {
        console.log(successChalk(`precommit check cost ${duration}s`));
      }
    });
  }
});

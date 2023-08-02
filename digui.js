function fact(num){
    console.log(num)
    if (num<=1){
        return 1;
    }else{
        return num*arguments.callee(num-1); //此处更改了。
    }
}
fact(4)

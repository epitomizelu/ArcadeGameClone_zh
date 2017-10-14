// 游戏角色的父类 
var Entity = function() {
    // 角色在地图上的x，y坐标
    this.x = 0;
    this.y = 0;

    // 角色身材
    this.width =0;
    this.height =0;

    // 敌人的图片或者雪碧图，用一个我们提供的工具函数来轻松的加载文件
    this.sprite = 'images/enemy-bug.png';
}

// 此为游戏必须的函数，用来在屏幕上画出角色
Entity.prototype.render = function() {
    var image = Resources.get(this.sprite);
    ctx.drawImage(image, this.x, this.y);
    this.setFigure(image.width,image.height);
};

// 设置角色的身材
Entity.prototype.setFigure = function(width , height) {
    this.width = width;
    this.height = height;
}

// 角色的状态初始化函数，主要是设置敌人的图片
Entity.prototype.init = function(url){
    this.sprite = url;
}

// 这是我们的玩家要躲避的敌人 
var Enemy = function() {
    // 要应用到每个敌人的实例的变量写在这里
    // 我们已经提供了一个来帮助你实现更多
    this.speed = 0;
    this.rowHeight =75;
    
    this.init('images/enemy-bug.png');
};

/**
 * 静态方法：根据指定数量创建敌人
 * @param {number} 需要创建敌人的数量
 * @return {[Enemy]} 根据指定的数量创建的由敌人构成的对象数组
 */
Enemy.createEnemies(num) {
     var allEnemies = [];

     for(var i=0;i<num;i++){
        allEnemies.push(new Enemy());
     }

     return allEnemies;
}

// 为敌人指定原型对象，使敌人和玩家继承自同一个父类
Enemy.prototype = new Entity();

// 记录每一行的敌人数量
Enemy.prototype.minXInEachRow = {1:0,2:0,3:0}

// 初始化敌人的状态
Enemy.prototype.init = function() {
    this.setY();
    this.initX();
    this.speed = this.getSpeed();
}

// 设置敌人出现的初始 y 坐标
Enemy.prototype.setY = function() {
     var row = Math.ceil(Math.random() * 3);
     this.y = row * this.rowHeight;
}

// 获取敌人出现的初始 x 坐标 ,同一行的敌人不要重叠，控制先后出现在同一行的两个相邻敌人的间距不超过三个身位
Enemy.prototype.initX = function() {
    var row = this.y/this.rowHeight,
        randomOffset = Math.ceil(Math.random() * 3);
    this.x =  this.minXInEachRow[row] - randomOffset * this.width;
    this.minXInEachRow[row] = this.x;
}

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function(dt) {
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
    this.x = this.x > ctx.canvas.width ? -3 * this.width : this.x + this.speed*dt;
    this.x > ctx.canvas.width ? this.setY() : this.y;
};

/**
 *为敌人赋速度
 *@return (number) 速度值为[10,20]之间
 */ 
Enemy.prototype.getSpeed = function() {
    return Math.ceil(Math.random()*50)+30;
}

// 现在实现你自己的玩家类
// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
var Player = function() {
    // 纵向步长
    this.vStep  = 75;

    // 横向步长
    this.hStep = 101;
 
    // 在地图中的行列号
    this.row = 5;
    this.col = 2;

    this.init('images/char-boy.png');
}

// 为玩家指定原型对象，使敌人和玩家继承自同一个父类
Player.prototype = new Entity();

// 重置玩家的位置
Player.prototype.reset = function() {
    this.col = 2 ;
    this.row = 5 ;
}

/**
 * 1，用来更新玩家的位置
 * 2，更新之后进行碰撞检测
 * @param  {number} dt [表示时间间隙]
 */
Player.prototype.update = function(dt) {
    this.x = this.col * this.hStep;
    this.y = this.row * this.vStep;

    // 玩家移动之后，要检测是否发生了碰撞，如果发生了碰撞，玩家要回到游戏开始时的位置
    if(this.detectCrash()){
       this.reset();
    }
}

/*
 *玩家移动后的碰撞检测
 *@return {boolean} true:敌人和玩家发生了碰撞，false ：敌人和玩家没有发生碰撞
 */
Player.prototype.detectCrash = function() {
    var that = this;

    return allEnemies.some(function(item, index) {
        // 1,先决条件：玩家和敌人是否在同一行，位于同一行才可能碰撞
        if(parseInt(item.y/item.rowHeight) != parseInt(that.y/that.vStep)){
            return;
        }

        // 2，玩家位于敌人右边
        if(item.x < that.x && that.x - item.x < item.width/2){
            return true;
        }

        // 3，玩家位于敌人左边
        if(item.x > that.x && item.x - that.x < that.width/2){
            return true;
        }

        return false;
    });
}

// 监听用户的操作（向上、下、左、右四个方向移动玩家），并完成响应的动作
Player.prototype.handleInput = function(direction) {
    if(!direction)return;

    // 左移且在移动范围内
    if(direction == 'right' && this.col <4){
         this.col += 1;
    }

    // 右移且在移动范围内
    if(direction == 'left' && this.col >0 ){
         this.col -= 1;
    }

    // 下移且在画布范围内
    if(direction == 'down' && this.row <5){
         this.row += 1;
    }

    // 上移且在画布范围内
    if(direction == 'up' && this.row >0){
         this.row -= 1;
    }

}

// 现在实例化你的所有对象
// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
// 把玩家对象放进一个叫 player 的变量里面
var allEnemies = Enemy.createEnemies(9),
    player = new Player();
    
// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

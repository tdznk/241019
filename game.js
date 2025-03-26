    // 获取DOM元素
    const gameArea = document.getElementById('gameArea');
    const player = document.getElementById('player');
    const healthPoint = document.getElementById('health');
    const playerHealthBar = document.getElementById('playerHealthBar');
    const scoreDisplay = document.getElementById('score');
    const messageDisplay = document.getElementById('message');
    const staminaDisplay = document.getElementById('stamina'); 
    const keys = {
        w: false,
        a: false,
        s: false,
        d: false,
    };
    // 初始化玩家属性
    let playerHealth = 100; // 玩家生命值
    let fullHealth = 100;
    let score = 0; // 玩家得分
    let enemies = []; // 存储敌人
    let items = []; // 存储道具
    let attackDamage = 30; // 玩家攻击伤害
    let availablePoints = 0; // 可用点数
    let doubleDamage = 1; // 攻击增强状态
    let reducedEnemyDamage = false; // 敌人伤害减少状态
    let stamina = 100; // 初始耐力值
    let fullStamina = 100;//初始耐力最大值
    let invincibleTime = false;
    let lastUpdateTime = 0;
    let enemyHealth = 100;

    // 更新耐力值显示
    staminaDisplay.innerText = stamina; 

    // 生成敌人
    function spawnEnemy() {
        const enemy = document.createElement('div'); // 创建敌人元素
        enemy.classList.add('enemy'); // 添加敌人样式(类)
        // 随机生成敌人的位置
        enemy.style.left = Math.random() * (gameArea.clientWidth - 40) + 'px';
        enemy.style.top = Math.random() * (gameArea.clientHeight - 40) + 'px';
        // 敌人初始生命值
        enemy.health = enemyHealth; 
        enemy.fullHealth = enemyHealth;
        // 创建血量条
        const healthBar = document.createElement('div');
        healthBar.classList.add('healthBar'); // 添加血量条样式
        enemy.appendChild(healthBar); // 将血量条添加到敌人元素
        enemy.healthBar = healthBar; // 保存敌人的血量条

        gameArea.appendChild(enemy); // 将敌人添加到游戏区域
        enemies.push(enemy); // 将敌人存储在数组中
        
        moveEnemy(enemy); // 开始移动敌人
    }

    // 移动敌人
    function moveEnemy(enemy) {
        const moveInterval = setInterval(() => {
    
            const playerRect = player.getBoundingClientRect(); // 获取玩家的位置
            const enemyRect = enemy.getBoundingClientRect(); // 获取敌人位置
    
            // 敌人向玩家移动
            if (enemyRect.left < playerRect.left) enemy.style.left = (enemy.offsetLeft + 1) + 'px';
            if (enemyRect.right > playerRect.right) enemy.style.left = (enemy.offsetLeft - 1) + 'px';
            if (enemyRect.top < playerRect.top) enemy.style.top = (enemy.offsetTop + 1) + 'px';
            if (enemyRect.bottom > playerRect.bottom) enemy.style.top = (enemy.offsetTop - 1) + 'px';
    
            // 随机移动
            enemy.style.left = (enemy.offsetLeft + (Math.random() * 4 - 2)) + 'px';
            enemy.style.top = (enemy.offsetTop + (Math.random() * 4 - 2)) + 'px';
    
            // 检测接触
            if (isColliding(playerRect, enemyRect)) {
                if (!invincibleTime) {
                    playerHealth -= (reducedEnemyDamage ? 10 : 20); // 根据状态扣除生命值
                    healthPoint.innerText = playerHealth + "/" + fullHealth; // 更新生命值显示
                    playerHealthBar.style.width = 40 * (playerHealth / fullHealth) + 'px'; // 更新血量条宽度
                    enemy.style.left = (enemy.offsetLeft - 20) + 'px'; // 敌人反向移动
                    invincibleTime = true;
                    setTimeout(() => { invincibleTime = false }, 800);
                }
                // 检查玩家是否被击败
                if (playerHealth <= 0) {
                    alert('游戏结束！你被击败了。');
                    location.href = location.href; // 重置游戏
                }
            }
    
            // 检查道具拾取
            checkItemPickup(playerRect);
        }, 100); // 每100毫秒移动一次
    
        enemy.moveInterval = moveInterval; // 保存移动间隔，以便在击败敌人时清除
    }

    // 检测碰撞
    function isColliding(rect1, rect2) {
        return !(rect2.left + 5 > rect1.right || 
                 rect2.right < rect1.left + 5|| 
                 rect2.top + 5 > rect1.bottom || 
                 rect2.bottom < rect1.top + 5);
    }

    // 攻击敌人
    function attackEnemy(enemy) {
        enemy.health -= (doubleDamage * attackDamage); // 根据状态计算伤害
        enemy.healthBar.style.width = 40 * (enemy.health / enemy.fullHealth) + 'px'; // 更新敌人血量条
        if (enemy.health <= 0) {
            clearInterval(enemy.moveInterval); // 清除敌人移动定时器
            gameArea.removeChild(enemy); // 从游戏区域移除敌人
            enemies = enemies.filter(e => e !== enemy); // 更新敌人数组
            score++; // 增加分数
            scoreDisplay.innerText = score; // 更新分数显示
            //检查是否升级
            if (score % 5 ===0){
                availablePoints++;
                document.getElementById('availablePoints').innerText = availablePoints; // 更新可用点数显示
            }
        }
    }

    // 生成道具
    function spawnItem() {
        const item = document.createElement('div'); // 创建道具元素
        item.classList.add('item'); // 添加道具样式
        const itemType = Math.floor(Math.random()*4);// 概率生成每种道具

        // 设置不同道具类型的样式
        if (itemType === 0) {
            item.classList.add('heal-item'); // 设置为生命回复道具样式
            item.setAttribute('data-type', 'heal'); // 设置道具类型属性
        } else if (itemType === 1){
            item.classList.add('boost-item'); // 设置为增强攻击道具样式
            item.setAttribute('data-type', 'boost'); // 设置道具类型属性
        } else if (itemType === 2){
            item.classList.add('stamina-item'); // 设置为耐力回复道具样式
            item.setAttribute('data-type', 'stamina'); // 设置道具类型属性
        } else if (itemType === 3){
            item.classList.add('reducedDamage-item'); // 设置为减少伤害道具样式
            item.setAttribute('data-type', 'reducedDamage'); // 设置道具类型属性
        }

        // 随机生成道具位置
        item.style.left = Math.random() * (gameArea.clientWidth - 40) + 'px';
        item.style.top = Math.random() * (gameArea.clientHeight - 40) + 'px';

        gameArea.appendChild(item); // 将道具添加到游戏区域
        items.push(item); // 将道具存储在数组中
    }

    // 检查道具拾取
    function checkItemPickup(playerRect) {
        items.forEach(item => {
            const itemRect = item.getBoundingClientRect(); // 获取道具位置
            if (isColliding(playerRect, itemRect)) {
                // 处理道具拾取
                const itemType = item.getAttribute('data-type'); // 获取道具类型
                if (itemType === 'heal' && playerHealth < fullHealth) {
                    playerHealth += 20; // 增加生命值
                    if (playerHealth > fullHealth) playerHealth = fullHealth; // 限制最大生命值
                    healthPoint.innerText = playerHealth + "/" +fullHealth; // 更新生命值显示
                    playerHealthBar.style.width = 40*(playerHealth + "/" +fullHealth) + 'px'; // 更新血量条宽度
                    showMessage("获得了生命回复道具！"); // 显示道具提示
                } else if (itemType === 'boost') {
                    doubleDamage = 2; // 激活攻击增强状态
                    document.getElementById('attackDamage').innerText = doubleDamage * attackDamage; // 更新攻击力显示
                    setTimeout(() => { doubleDamage = 1;document.getElementById('attackDamage').innerText = doubleDamage * attackDamage;  }, 5000); // 5秒后取消增强
                    
                    showMessage("获得了攻击增强道具！"); // 显示道具提示
                } else if (itemType === 'stamina') {
                    stamina += 40; // 回复40点耐力
                    if (stamina > fullStamina) stamina = fullStamina; // 限制最大耐力值
                    staminaDisplay.innerText = stamina; // 更新耐力值显示
                    showMessage("获得了耐力回复道具！"); // 显示道具提示
                } else if (itemType === 'reducedDamage') {
                    reducedEnemyDamage = true; // 激活伤害减少状态
                    setTimeout(() => { reducedEnemyDamage = false; }, 5000); // 5秒后取消增强
                    showMessage("获得了防御提升道具！"); // 显示道具提示
                }
                gameArea.removeChild(item); // 从游戏区域移除道具
                items = items.filter(i => i !== item); // 更新道具数组
            }
        });
    }

    // 显示提示信息
    function showMessage(message) {
        messageDisplay.innerText = message; // 更新提示信息
        messageDisplay.style.display = 'block'; // 显示提示
        setTimeout(() => {
            messageDisplay.style.display = 'none'; 
        }, 5000); // 5000毫秒后隐藏
    }

    // 增强敌人
    function strengthenEnemies() {
        enemies.forEach(enemy => {
            enemyHealth += 20; // 增加敌人生命值
            enemy.healthBar.style.width = 40 * (enemy.health / enemy.fullHealth) + 'px'; // 更新血量条
        });
    }

    // 随机生成敌人
    function spawnEnemiesRandomly() {
        setInterval(() => {
            spawnEnemy(); // 调用生成敌人函数
        }, Math.random() * 5000 + 2000); // 敌人每2到5秒生成一个

    }

    // 随机生成道具
    function spawnItemsRandomly() {
        setInterval(() => {
            spawnItem(); // 调用生成道具函数
        }, 15000); // 每15秒生成一个道具
    }

    // 随机增强敌人
    function strengthenEnemiesRandomly() {
        setInterval(() => {
            strengthenEnemies(); // 调用增强敌人函数
        }, 15000); // 每15秒增强敌人
    }

    // 启动游戏
    function startGame() {
        spawnEnemiesRandomly(); // 开始随机生成敌人
        spawnItemsRandomly(); // 开始随机生成道具
        strengthenEnemiesRandomly(); // 开始随机增强敌人
        // 每1秒回复5点耐力
        setInterval(() => {
            if (stamina < fullStamina) { // 如果耐力没有满
                stamina += 5;
                if (stamina > fullStamina) stamina = fullStamina; // 限制最大耐力值
                staminaDisplay.innerText = stamina; // 更新耐力值显示
            }
        }, 1000); // 每1秒执行一次
        gameLoop();
    }

    // 玩家攻击逻辑
    function playerAttack() {
        if (stamina < 3) {
            showMessage("耐力不足，无法攻击！"); // 显示提示
            stamina = 0;
            staminaDisplay.innerText = stamina; // 更新耐力值显示
            return; // 如果耐力不足，直接返回
        }
        const playerRect = player.getBoundingClientRect(); // 获取玩家位置
        enemies.forEach(enemy => {
            const enemyRect = enemy.getBoundingClientRect(); // 获取敌人位置
            const distance = getDistance(playerRect, enemyRect); // 计算距离
            if (distance <= 100) { // 如果距离小于等于100像素
                attackEnemy(enemy); // 攻击敌人
            }
            staminaDisplay.innerText = stamina; // 更新耐力值显示
        });
    }

    // 计算两者之间的距离
    function getDistance(rect1, rect2) {
        const dx = rect1.left - rect2.left; // X轴距离
        const dy = rect1.top - rect2.top; // Y轴距离
        return Math.sqrt(dx * dx + dy * dy); // 返回距离
    }

    //升级系统
    // 增加生命值
    document.getElementById('increaseHealth').addEventListener('click', () => {
        document.getElementById('increaseHealth').blur();
        if (availablePoints > 0) {
            fullHealth += 10;
            availablePoints--;
            document.getElementById('health').innerText = playerHealth + "/" + fullHealth; // 更新生命值显示
            document.getElementById('availablePoints').innerText = availablePoints; // 更新可用点数显示
        }
    });

    // 增加攻击力
    document.getElementById('increaseDamage').addEventListener('click', () => {
        document.getElementById('increaseDamage').blur();
        if (availablePoints > 0) {
            attackDamage += 10;
            availablePoints--;
            document.getElementById('attackDamage').innerText = doubleDamage * attackDamage; // 更新攻击力显示
            document.getElementById('availablePoints').innerText = availablePoints; // 更新可用点数显示
        }
    });

    // 监听按键事件
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            stamina -= 5; // 消耗耐力
            playerAttack();// 调用攻击函数
        }
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true; // 按下按键
        }
    });

    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false; // 松开按键
        }
    });

    // 更新角色位置
    function updatePlayerPosition() {
        const step = 2; // 移动步长
        const playerRect = player.getBoundingClientRect();

        if (keys.w && playerRect.top > gameArea.getBoundingClientRect().top) {
            player.style.top = (player.offsetTop - step) + 'px'; // 向上移动
        }
        if (keys.s && playerRect.bottom < gameArea.getBoundingClientRect().bottom) {
            player.style.top = (player.offsetTop + step) + 'px'; // 向下移动
        }
        if (keys.a && playerRect.left > gameArea.getBoundingClientRect().left) {
            player.style.left = (player.offsetLeft - step) + 'px'; // 向左移动
        }
        if (keys.d && playerRect.right < gameArea.getBoundingClientRect().right) {
            player.style.left = (player.offsetLeft + step) + 'px'; // 向右移动
        }
    }
    // 游戏主循环
    function gameLoop(currentTime) {
        // 每 10 毫秒更新一次
        if (currentTime - lastUpdateTime > 10) { 
            updatePlayerPosition(); // 更新角色位置
            lastUpdateTime = currentTime;
        }
        requestAnimationFrame(gameLoop); // 循环
    }


    // 初始化游戏
    startGame(); // 启动游戏

// ========== 多莉冒险场景逻辑 ==========

let currentDoryDialogueIndex = 0;
let doryUserFishData = null;
let doryDialogueSequence = [];
let doryDialogueActive = false;
let doryAdventureInitialized = false;

// 初始化多莉冒险场景
function initDoryAdventure() {
    if (doryAdventureInitialized) return;
    doryAdventureInitialized = true;
    
    console.log('初始化多莉冒险场景...');
    
    // 安全检查：必须拥有多莉且未完成冒险
    const hasDory = ownedItems && ownedItems.includes('dory');
    const hasCompletedAdventure = localStorage.getItem('doryAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasDory, hasCompletedAdventure, ownedItems });
    
    if (!hasDory) {
        alert('错误：未拥有多莉');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    doryUserFishData = getUserLatestFish();
    
    if (!doryUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', doryUserFishData);
    
    // 设置对话序列
    doryDialogueSequence = [
        {
            speaker: 'dory',
            message: '晃悠悠游过来撞到你，晃了晃脑袋站稳，噢，抱歉抱歉！嗨！我是多莉！… 等等，我是不是已经跟你介绍过自己了？',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '没关系，我是你的新朋友，我们可以一起去找尼莫。',
            delay: 2000
        },
        {
            speaker: 'dory',
            message: '尼莫！对！他是橙白相间的小鱼，特别可爱… 突然茫然，等等，我们为什么要去找他来着？',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '我们要帮他回到爸爸马林身边，别着急，慢慢想，路上我会提醒你。',
            delay: 2000
        },
        {
            speaker: 'dory',
            message: '不管我们是不是第一次见面，我现在超开心认识你！… 等等，我刚刚是不是说过这句话？',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '笑着点头，没关系，能认识你我也很开心。',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupDoryUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindDoryAdventureEvents();
    
    // 重置状态
    currentDoryDialogueIndex = 0;
    doryDialogueActive = true;
    
    // 显示对话容器
    const dialogueContainer = document.querySelector('.dory-dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextDoryDialogue();
}

// 绑定多莉冒险场景事件
function bindDoryAdventureEvents() {
    console.log('绑定多莉冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextDoryDialogue');
    const skipBtn = document.getElementById('skipDoryAdventure');
    const seaBtn = document.getElementById('goToSeaFromDoryAdventure');
    
    // 克隆元素并替换以清除旧的事件监听器
    const replaceElement = (element) => {
        if (!element) return;
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        return newElement;
    };
    
    // 替换元素
    const newNextBtn = replaceElement(nextBtn);
    const newSkipBtn = replaceElement(skipBtn);
    const newSeaBtn = replaceElement(seaBtn);
    
    // 绑定新事件
    if (newNextBtn) {
        newNextBtn.addEventListener('click', showNextDoryDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipDoryAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeDoryAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在多莉场景中
function setupDoryUserFishInScene() {
    const userFishContainer = document.querySelector('.dory-character-user-fish');
    const doryContainer = document.querySelector('.dory-character-dory');
    
    if (!userFishContainer || !doryContainer || !doryUserFishData) {
        console.error('多莉场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    doryContainer.innerHTML = '';
    
    // 创建多莉图片和名字
    const doryImg = document.createElement('img');
    doryImg.src = 'assets/dory.png';
    doryImg.alt = '多莉';
    doryImg.className = 'adventure-character';
    doryImg.style.objectFit = 'contain';
    
    const doryName = document.createElement('div');
    doryName.className = 'character-name';
    doryName.textContent = '多莉';
    
    doryContainer.appendChild(doryImg);
    doryContainer.appendChild(doryName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (doryUserFishData.imgSrc && doryUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = doryUserFishData.imgSrc;
    } else {
        userFishImg.src = doryUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = doryUserFishData.name;
    userFishImg.className = 'adventure-character';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = doryUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('多莉场景角色已添加到场景');
}

// 显示多莉下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextDoryDialogue() {
    console.log('显示多莉下一个对话，当前索引:', currentDoryDialogueIndex);
    
    if (!doryDialogueActive) return;
    
    if (currentDoryDialogueIndex >= doryDialogueSequence.length) {
        console.log('多莉对话已结束，进入海洋');
        completeDoryDialogue();
        return;
    }
    
    const dialogue = doryDialogueSequence[currentDoryDialogueIndex];
    console.log('当前多莉对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = doryDialogueSequence.slice(0, currentDoryDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('多莉最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.dory-dialogue-container');
    if (!dialogueContainer) {
        console.error('多莉对话容器缺失');
        return;
    }
    
    // 优雅地移除旧对话
    const existingDialogues = dialogueContainer.querySelectorAll('.dialogue-box');
    const removePromises = [];
    
    existingDialogues.forEach((dialogue, index) => {
        const promise = new Promise((resolve) => {
            // 添加淡出效果
            dialogue.classList.add('fade-out');
            
            // 设置不同延迟，让旧对话依次淡出
            setTimeout(() => {
                if (dialogue.parentNode === dialogueContainer) {
                    dialogueContainer.removeChild(dialogue);
                }
                resolve();
            }, 150 + (index * 50)); // 依次淡出
        });
        removePromises.push(promise);
    });
    
    // 等所有旧对话都移除后，添加新对话
    Promise.all(removePromises).then(() => {
        // 清空容器
        dialogueContainer.innerHTML = '';
        
        // 创建并显示最近的两条对话
        recentDialogues.forEach((dialogueItem, index) => {
            const isDory = dialogueItem.speaker === 'dory';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isDory ? 'dialogue-box spongebob-dialogue dory-dialogue-left' : 'dialogue-box userfish-dialogue dory-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isDory ? '多莉' : (doryUserFishData ? doryUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isDory) {
                speakerElement.style.textAlign = 'left';
                messageElement.style.textAlign = 'left';
            }
            
            dialogueBox.appendChild(speakerElement);
            dialogueBox.appendChild(messageElement);
            
            // 设置初始状态（在下方，准备向上滑动）
            dialogueBox.style.opacity = '0';
            dialogueBox.style.transform = 'translateY(25px) scale(0.97)';
            dialogueBox.style.transition = 'opacity 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            dialogueContainer.appendChild(dialogueBox);
            
            // 使用requestAnimationFrame确保流畅动画
            requestAnimationFrame(() => {
                // 添加轻微延迟，实现依次出现的效果
                setTimeout(() => {
                    dialogueBox.style.opacity = '1';
                    dialogueBox.style.transform = 'translateY(0) scale(1)';
                }, index * 120); // 第二条对话稍晚出现
            });
        });
    });
    
    currentDoryDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentDoryDialogueIndex >= doryDialogueSequence.length) {
        console.log('多莉对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextDoryDialogue');
        const skipBtn = document.getElementById('skipDoryAdventure');
        const seaBtn = document.getElementById('goToSeaFromDoryAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completeDoryDialogue();
        }, 3000);
    }
}

// 完成多莉对话
function completeDoryDialogue() {
    if (!doryDialogueActive) return;
    doryDialogueActive = false;
    
    console.log('完成多莉对话序列');
    
    const doryDialogue = document.querySelector('.dory-dialogue-left');
    const userfishDialogue = document.querySelector('.dory-dialogue-right');
    
    if (doryDialogue) doryDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextDoryDialogue');
    const skipBtn = document.getElementById('skipDoryAdventure');
    const seaBtn = document.getElementById('goToSeaFromDoryAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('多莉对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completeDoryAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过多莉冒险
function skipDoryAdventure() {
    console.log('跳过多莉冒险');
    if (confirm('确定要跳过多莉的冒险吗？')) {
        completeDoryAdventure();
        goTo('sea');
    }
}

// 完成多莉冒险
function completeDoryAdventure() {
    console.log('完成多莉冒险');
    
    // 标记冒险已完成
    localStorage.setItem('doryAdventureCompleted', 'true');
    
    // 确保多莉在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const doryFish = fishes.find(fish => fish && fish.id === 'store_dory');
        if (doryFish) {
            doryFish.hidden = false;
            // 更新多莉的故事，使其包含特殊对话
            doryFish.story = '嗨！我是多莉！… 等等，我是不是已经跟你介绍过自己了？让我们一起去找尼莫吧！';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('多莉冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化多莉冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 多莉冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是多莉冒险场景，延迟初始化
            if (name === 'doryAdventure') {
                setTimeout(() => {
                    initDoryAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                doryAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在多莉冒险场景
    const adventureScreen = document.getElementById('doryAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在多莉冒险场景，初始化...');
        setTimeout(() => {
            initDoryAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initDoryAdventure = initDoryAdventure;
window.goToDoryAdventure = function() {
    goTo('doryAdventure');
};

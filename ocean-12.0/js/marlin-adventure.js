// ========== 马林冒险场景逻辑 ==========

let currentMarlinDialogueIndex = 0;
let marlinUserFishData = null;
let marlinDialogueSequence = [];
let marlinDialogueActive = false;
let marlinAdventureInitialized = false;

// 初始化马林冒险场景
function initMarlinAdventure() {
    if (marlinAdventureInitialized) return;
    marlinAdventureInitialized = true;
    
    console.log('初始化马林冒险场景...');
    
    // 安全检查：必须拥有马林且未完成冒险
    const hasMarlin = ownedItems && ownedItems.includes('marlin');
    const hasCompletedAdventure = localStorage.getItem('marlinAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasMarlin, hasCompletedAdventure, ownedItems });
    
    if (!hasMarlin) {
        alert('错误：未拥有马林');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    marlinUserFishData = getUserLatestFish();
    
    if (!marlinUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', marlinUserFishData);
    
    // 设置对话序列
    marlinDialogueSequence = [
        {
            speaker: 'marlin',
            message: '一脸紧张拦住你，爪子攥着手绘地图，你是不是要带尼莫去沉船遗迹探险？',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '是啊，尼莫他们准备得很充分，我也会保护好他，你别担心。',
            delay: 2000
        },
        {
            speaker: 'marlin',
            message: '叹口气把地图塞给你，我不是不让他去，就是担心他出事。这地图标了危险海草、暗流和安全区，你一定要带好。又掏出荧光草和解毒海草，这个用来照明，这个能解海草毒，千万别丢。',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '接过东西，你放心，我肯定照顾好尼莫，按地图走，绝不冒险。',
            delay: 2000
        },
        {
            speaker: 'marlin',
            message: '还是不放心，又叮嘱，遇到大危险别逞强，第一时间带他回来，宝藏不重要，安全才是第一位！别让他往船深处跑，那里容易迷路。',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '我都记下来了，保证让他安全回来。',
            delay: 2000
        },
        {
            speaker: 'marlin',
            message: '这才松了口气，那就麻烦你了！等你们回来，我做一大份海藻饼招待你！',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupMarlinUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindMarlinAdventureEvents();
    
    // 重置状态
    currentMarlinDialogueIndex = 0;
    marlinDialogueActive = true;
    
    // 显示对话容器
    const dialogueContainer = document.querySelector('.marlin-dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextMarlinDialogue();
}

// 绑定马林冒险场景事件
function bindMarlinAdventureEvents() {
    console.log('绑定马林冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextMarlinDialogue');
    const skipBtn = document.getElementById('skipMarlinAdventure');
    const seaBtn = document.getElementById('goToSeaFromMarlinAdventure');
    
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
        newNextBtn.addEventListener('click', showNextMarlinDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipMarlinAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeMarlinAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在马林场景中
function setupMarlinUserFishInScene() {
    const userFishContainer = document.querySelector('.marlin-character-user-fish');
    const marlinContainer = document.querySelector('.marlin-character-marlin');
    
    if (!userFishContainer || !marlinContainer || !marlinUserFishData) {
        console.error('马林场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    marlinContainer.innerHTML = '';
    
    // 创建马林图片和名字
    const marlinImg = document.createElement('img');
    marlinImg.src = 'assets/marlin.png';
    marlinImg.alt = '马林';
    marlinImg.className = 'adventure-character';
    marlinImg.style.objectFit = 'contain';
    
    const marlinName = document.createElement('div');
    marlinName.className = 'character-name';
    marlinName.textContent = '马林';
    
    marlinContainer.appendChild(marlinImg);
    marlinContainer.appendChild(marlinName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (marlinUserFishData.imgSrc && marlinUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = marlinUserFishData.imgSrc;
    } else {
        userFishImg.src = marlinUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = marlinUserFishData.name;
    userFishImg.className = 'adventure-character';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = marlinUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('马林场景角色已添加到场景');
}

// 显示马林下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextMarlinDialogue() {
    console.log('显示马林下一个对话，当前索引:', currentMarlinDialogueIndex);
    
    if (!marlinDialogueActive) return;
    
    if (currentMarlinDialogueIndex >= marlinDialogueSequence.length) {
        console.log('马林对话已结束，进入海洋');
        completeMarlinDialogue();
        return;
    }
    
    const dialogue = marlinDialogueSequence[currentMarlinDialogueIndex];
    console.log('当前马林对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = marlinDialogueSequence.slice(0, currentMarlinDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('马林最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.marlin-dialogue-container');
    if (!dialogueContainer) {
        console.error('马林对话容器缺失');
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
            const isMarlin = dialogueItem.speaker === 'marlin';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isMarlin ? 'dialogue-box spongebob-dialogue marlin-dialogue-left' : 'dialogue-box userfish-dialogue marlin-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isMarlin ? '马林' : (marlinUserFishData ? marlinUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isMarlin) {
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
    
    currentMarlinDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentMarlinDialogueIndex >= marlinDialogueSequence.length) {
        console.log('马林对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextMarlinDialogue');
        const skipBtn = document.getElementById('skipMarlinAdventure');
        const seaBtn = document.getElementById('goToSeaFromMarlinAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completeMarlinDialogue();
        }, 3000);
    }
}

// 完成马林对话
function completeMarlinDialogue() {
    if (!marlinDialogueActive) return;
    marlinDialogueActive = false;
    
    console.log('完成马林对话序列');
    
    const marlinDialogue = document.querySelector('.marlin-dialogue-left');
    const userfishDialogue = document.querySelector('.marlin-dialogue-right');
    
    if (marlinDialogue) marlinDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextMarlinDialogue');
    const skipBtn = document.getElementById('skipMarlinAdventure');
    const seaBtn = document.getElementById('goToSeaFromMarlinAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('马林对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completeMarlinAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过马林冒险
function skipMarlinAdventure() {
    console.log('跳过马林冒险');
    if (confirm('确定要跳过马林的冒险吗？')) {
        completeMarlinAdventure();
        goTo('sea');
    }
}

// 完成马林冒险
function completeMarlinAdventure() {
    console.log('完成马林冒险');
    
    // 标记冒险已完成
    localStorage.setItem('marlinAdventureCompleted', 'true');
    
    // 确保马林在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const marlinFish = fishes.find(fish => fish && fish.id === 'store_marlin');
        if (marlinFish) {
            marlinFish.hidden = false;
            // 更新马林的故事，使其包含特殊对话
            marlinFish.story = '安全最重要！请一定要照顾好尼莫，按地图走，遇到危险第一时间带他回来！';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('马林冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化马林冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 马林冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是马林冒险场景，延迟初始化
            if (name === 'marlinAdventure') {
                setTimeout(() => {
                    initMarlinAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                marlinAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在马林冒险场景
    const adventureScreen = document.getElementById('marlinAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在马林冒险场景，初始化...');
        setTimeout(() => {
            initMarlinAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initMarlinAdventure = initMarlinAdventure;
window.goToMarlinAdventure = function() {
    goTo('marlinAdventure');
};

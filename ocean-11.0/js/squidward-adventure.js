// ========== 章鱼哥冒险场景逻辑 ==========

let currentSquidwardDialogueIndex = 0;
let squidwardUserFishData = null;
let squidwardDialogueSequence = [];
let squidwardDialogueActive = false;
let squidwardAdventureInitialized = false;

// 初始化章鱼哥冒险场景
function initSquidwardAdventure() {
    if (squidwardAdventureInitialized) return;
    squidwardAdventureInitialized = true;
    
    console.log('初始化章鱼哥冒险场景...');
    
    // 安全检查：必须拥有章鱼哥且未完成冒险
    const hasSquidward = ownedItems && ownedItems.includes('squidward');
    const hasCompletedAdventure = localStorage.getItem('squidwardAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasSquidward, hasCompletedAdventure, ownedItems });
    
    if (!hasSquidward) {
        alert('错误：未拥有章鱼哥');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    squidwardUserFishData = getUserLatestFish();
    
    if (!squidwardUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', squidwardUserFishData);
    
    // 设置对话序列
    squidwardDialogueSequence = [
        {
            speaker: 'squidward',
            message: '抱着竖笛，眉头皱成 "川" 字，身后拖着半卷铺盖，行了，入职流程赶紧走完，我没功夫耗着。先说好：午休多久？有艺术创作假吗？周末能双休吗？',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '午休 1 小时，完成基本工作就能自由安排，也能随时演奏竖笛，创作假和双休都有。',
            delay: 2000
        },
        {
            speaker: 'squidward',
            message: '怀疑地上下打量你，这肯定是陷阱，不过既然你这么说，我下午 3 点要办个人独奏会，谁都别打扰我排练，尤其是那个方裤子家伙。',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '放心，不会有人打扰你，工作之余也好好放松。',
            delay: 2000
        },
        {
            speaker: 'squidward',
            message: '长叹一口气，掏出小本子记下，那我去 "工作" 了 —— 说白了就是找个安静地方待着，别来烦我。',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '没问题，你安心休息排练就好。',
            delay: 2000
        },
        {
            speaker: 'squidward',
            message: '但愿你别像那个方裤子家伙一样聒噪… 不过，还是谢了，至少你尊重我的艺术。',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupSquidwardUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindSquidwardAdventureEvents();
    
    // 重置状态
    currentSquidwardDialogueIndex = 0;
    squidwardDialogueActive = true;
    
    // 显示对话容器
    const dialogueContainer = document.querySelector('.squidward-dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextSquidwardDialogue();
}

// 绑定章鱼哥冒险场景事件
function bindSquidwardAdventureEvents() {
    console.log('绑定章鱼哥冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextSquidwardDialogue');
    const skipBtn = document.getElementById('skipSquidwardAdventure');
    const seaBtn = document.getElementById('goToSeaFromSquidwardAdventure');
    
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
        newNextBtn.addEventListener('click', showNextSquidwardDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipSquidwardAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeSquidwardAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在章鱼哥场景中
function setupSquidwardUserFishInScene() {
    const userFishContainer = document.querySelector('.squidward-character-user-fish');
    const squidwardContainer = document.querySelector('.squidward-character-squidward');
    
    if (!userFishContainer || !squidwardContainer || !squidwardUserFishData) {
        console.error('章鱼哥场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    squidwardContainer.innerHTML = '';
    
    // 创建章鱼哥图片和名字
    const squidwardImg = document.createElement('img');
    squidwardImg.src = 'assets/squidward.png';
    squidwardImg.alt = '章鱼哥';
    squidwardImg.className = 'adventure-character';
    squidwardImg.style.objectFit = 'contain';
    
    const squidwardName = document.createElement('div');
    squidwardName.className = 'character-name';
    squidwardName.textContent = '章鱼哥';
    
    squidwardContainer.appendChild(squidwardImg);
    squidwardContainer.appendChild(squidwardName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (squidwardUserFishData.imgSrc && squidwardUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = squidwardUserFishData.imgSrc;
    } else {
        userFishImg.src = squidwardUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = squidwardUserFishData.name;
    userFishImg.className = 'adventure-character';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = squidwardUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('章鱼哥场景角色已添加到场景');
}

// 显示章鱼哥下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextSquidwardDialogue() {
    console.log('显示章鱼哥下一个对话，当前索引:', currentSquidwardDialogueIndex);
    
    if (!squidwardDialogueActive) return;
    
    if (currentSquidwardDialogueIndex >= squidwardDialogueSequence.length) {
        console.log('章鱼哥对话已结束，进入海洋');
        completeSquidwardDialogue();
        return;
    }
    
    const dialogue = squidwardDialogueSequence[currentSquidwardDialogueIndex];
    console.log('当前章鱼哥对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = squidwardDialogueSequence.slice(0, currentSquidwardDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('章鱼哥最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.squidward-dialogue-container');
    if (!dialogueContainer) {
        console.error('章鱼哥对话容器缺失');
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
            const isSquidward = dialogueItem.speaker === 'squidward';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isSquidward ? 'dialogue-box spongebob-dialogue squidward-dialogue-left' : 'dialogue-box userfish-dialogue squidward-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isSquidward ? '章鱼哥' : (squidwardUserFishData ? squidwardUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isSquidward) {
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
    
    currentSquidwardDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentSquidwardDialogueIndex >= squidwardDialogueSequence.length) {
        console.log('章鱼哥对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextSquidwardDialogue');
        const skipBtn = document.getElementById('skipSquidwardAdventure');
        const seaBtn = document.getElementById('goToSeaFromSquidwardAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completeSquidwardDialogue();
        }, 3000);
    }
}

// 完成章鱼哥对话
function completeSquidwardDialogue() {
    if (!squidwardDialogueActive) return;
    squidwardDialogueActive = false;
    
    console.log('完成章鱼哥对话序列');
    
    const squidwardDialogue = document.querySelector('.squidward-dialogue-left');
    const userfishDialogue = document.querySelector('.squidward-dialogue-right');
    
    if (squidwardDialogue) squidwardDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextSquidwardDialogue');
    const skipBtn = document.getElementById('skipSquidwardAdventure');
    const seaBtn = document.getElementById('goToSeaFromSquidwardAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('章鱼哥对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completeSquidwardAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过章鱼哥冒险
function skipSquidwardAdventure() {
    console.log('跳过章鱼哥冒险');
    if (confirm('确定要跳过章鱼哥的冒险吗？')) {
        completeSquidwardAdventure();
        goTo('sea');
    }
}

// 完成章鱼哥冒险
function completeSquidwardAdventure() {
    console.log('完成章鱼哥冒险');
    
    // 标记冒险已完成
    localStorage.setItem('squidwardAdventureCompleted', 'true');
    
    // 确保章鱼哥在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const squidwardFish = fishes.find(fish => fish && fish.id === 'store_squidward');
        if (squidwardFish) {
            squidwardFish.hidden = false;
            // 更新章鱼哥的故事，使其包含特殊对话
            squidwardFish.story = '艺术！艺术！我是艺术家！让我安静地吹我的单簧管...';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('章鱼哥冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化章鱼哥冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 章鱼哥冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是章鱼哥冒险场景，延迟初始化
            if (name === 'squidwardAdventure') {
                setTimeout(() => {
                    initSquidwardAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                squidwardAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在章鱼哥冒险场景
    const adventureScreen = document.getElementById('squidwardAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在章鱼哥冒险场景，初始化...');
        setTimeout(() => {
            initSquidwardAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initSquidwardAdventure = initSquidwardAdventure;
window.goToSquidwardAdventure = function() {
    goTo('squidwardAdventure');
};
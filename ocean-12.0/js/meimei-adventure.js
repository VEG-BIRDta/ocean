// ========== 小美美冒险场景逻辑 ==========

let currentMeimeiDialogueIndex = 0;
let meimeiUserFishData = null;
let meimeiDialogueSequence = [];
let meimeiDialogueActive = false;
let meimeiAdventureInitialized = false;

// 初始化小美美冒险场景
function initMeimeiAdventure() {
    if (meimeiAdventureInitialized) return;
    meimeiAdventureInitialized = true;
    
    console.log('初始化小美美冒险场景...');
    
    // 安全检查：必须拥有小美美且未完成冒险
    const hasMeimei = ownedItems && ownedItems.includes('meimei');
    const hasCompletedAdventure = localStorage.getItem('meimeiAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasMeimei, hasCompletedAdventure, ownedItems });
    
    if (!hasMeimei) {
        alert('错误：未拥有小美美');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    meimeiUserFishData = getUserLatestFish();
    
    if (!meimeiUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', meimeiUserFishData);
    
    // 设置对话序列
    meimeiDialogueSequence = [
        {
            speaker: 'meimei',
            message: '你听，这里的波纹… 在唱一首我从未听过的歌，你能听懂它的节奏吗？',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '凑近听了听，确实能感受到水波的律动，就是不太懂怎么分辨，你能教教我吗？',
            delay: 2000
        },
        {
            speaker: 'meimei',
            message: '当然可以！你闭上眼睛，仔细听 —— 这是水流穿过珊瑚的 "沙沙"，这是小气泡升腾的 "咕噜"，合起来就是自然的旋律呀！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '照做后，真的感受到了不一样的韵律，太奇妙了！原来自然还有这么动听的歌声。',
            delay: 2000
        },
        {
            speaker: 'meimei',
            message: '音乐是心和心的桥梁～从今天起，只要你需要，我随时都能为你歌唱，也能陪你一起聆听这些自然的旋律！',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupMeimeiUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindMeimeiAdventureEvents();
    
    // 重置状态
    currentMeimeiDialogueIndex = 0;
    meimeiDialogueActive = true;
    
    // 显示对话容器
    const dialogueContainer = document.querySelector('.meimei-dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextMeimeiDialogue();
}

// 绑定小美美冒险场景事件
function bindMeimeiAdventureEvents() {
    console.log('绑定小美美冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextMeimeiDialogue');
    const skipBtn = document.getElementById('skipMeimeiAdventure');
    const seaBtn = document.getElementById('goToSeaFromMeimeiAdventure');
    
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
        newNextBtn.addEventListener('click', showNextMeimeiDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipMeimeiAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeMeimeiAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在小美美场景中
function setupMeimeiUserFishInScene() {
    const userFishContainer = document.querySelector('.meimei-character-user-fish');
    const meimeiContainer = document.querySelector('.meimei-character-meimei');
    
    if (!userFishContainer || !meimeiContainer || !meimeiUserFishData) {
        console.error('小美美场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    meimeiContainer.innerHTML = '';
    
    // 创建小美美图片和名字
    const meimeiImg = document.createElement('img');
    meimeiImg.src = 'assets/meimei.png';
    meimeiImg.alt = '小美美';
    meimeiImg.className = 'adventure-character';
    meimeiImg.style.objectFit = 'contain';
    
    const meimeiName = document.createElement('div');
    meimeiName.className = 'character-name';
    meimeiName.textContent = '小美美';
    
    meimeiContainer.appendChild(meimeiImg);
    meimeiContainer.appendChild(meimeiName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (meimeiUserFishData.imgSrc && meimeiUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = meimeiUserFishData.imgSrc;
    } else {
        userFishImg.src = meimeiUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = meimeiUserFishData.name;
    userFishImg.className = 'adventure-character';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = meimeiUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('小美美场景角色已添加到场景');
}

// 显示小美美下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextMeimeiDialogue() {
    console.log('显示小美美下一个对话，当前索引:', currentMeimeiDialogueIndex);
    
    if (!meimeiDialogueActive) return;
    
    if (currentMeimeiDialogueIndex >= meimeiDialogueSequence.length) {
        console.log('小美美对话已结束，进入海洋');
        completeMeimeiDialogue();
        return;
    }
    
    const dialogue = meimeiDialogueSequence[currentMeimeiDialogueIndex];
    console.log('当前小美美对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = meimeiDialogueSequence.slice(0, currentMeimeiDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('小美美最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.meimei-dialogue-container');
    if (!dialogueContainer) {
        console.error('小美美对话容器缺失');
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
            const isMeimei = dialogueItem.speaker === 'meimei';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isMeimei ? 'dialogue-box spongebob-dialogue meimei-dialogue-left' : 'dialogue-box userfish-dialogue meimei-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isMeimei ? '小美美' : (meimeiUserFishData ? meimeiUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isMeimei) {
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
    
    currentMeimeiDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentMeimeiDialogueIndex >= meimeiDialogueSequence.length) {
        console.log('小美美对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextMeimeiDialogue');
        const skipBtn = document.getElementById('skipMeimeiAdventure');
        const seaBtn = document.getElementById('goToSeaFromMeimeiAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completeMeimeiDialogue();
        }, 3000);
    }
}

// 完成小美美对话
function completeMeimeiDialogue() {
    if (!meimeiDialogueActive) return;
    meimeiDialogueActive = false;
    
    console.log('完成小美美对话序列');
    
    const meimeiDialogue = document.querySelector('.meimei-dialogue-left');
    const userfishDialogue = document.querySelector('.meimei-dialogue-right');
    
    if (meimeiDialogue) meimeiDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextMeimeiDialogue');
    const skipBtn = document.getElementById('skipMeimeiAdventure');
    const seaBtn = document.getElementById('goToSeaFromMeimeiAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('小美美对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completeMeimeiAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过小美美冒险
function skipMeimeiAdventure() {
    console.log('跳过小美美冒险');
    if (confirm('确定要跳过小美美的冒险吗？')) {
        completeMeimeiAdventure();
        goTo('sea');
    }
}

// 完成小美美冒险
function completeMeimeiAdventure() {
    console.log('完成小美美冒险');
    
    // 标记冒险已完成
    localStorage.setItem('meimeiAdventureCompleted', 'true');
    
    // 确保小美美在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const meimeiFish = fishes.find(fish => fish && fish.id === 'store_meimei');
        if (meimeiFish) {
            meimeiFish.hidden = false;
            // 更新小美美的故事，使其包含特殊对话
            meimeiFish.story = '你听，水波在唱歌呢～音乐是心和心的桥梁，让我们一起聆听自然的旋律吧！';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('小美美冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化小美美冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 小美美冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是小美美冒险场景，延迟初始化
            if (name === 'meimeiAdventure') {
                setTimeout(() => {
                    initMeimeiAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                meimeiAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在小美美冒险场景
    const adventureScreen = document.getElementById('meimeiAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在小美美冒险场景，初始化...');
        setTimeout(() => {
            initMeimeiAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initMeimeiAdventure = initMeimeiAdventure;
window.goToMeimeiAdventure = function() {
    goTo('meimeiAdventure');
};

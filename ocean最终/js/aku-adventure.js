// ========== 阿酷冒险场景逻辑 ==========

let currentAkuDialogueIndex = 0;
let akuUserFishData = null;
let akuDialogueSequence = [];
let akuDialogueActive = false;
let akuAdventureInitialized = false;

// 初始化阿酷冒险场景
function initAkuAdventure() {
    if (akuAdventureInitialized) return;
    akuAdventureInitialized = true;
    
    console.log('初始化阿酷冒险场景...');
    
    // 安全检查：必须拥有阿酷且未完成冒险
    const hasAku = ownedItems && ownedItems.includes('aku');
    const hasCompletedAdventure = localStorage.getItem('akuAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasAku, hasCompletedAdventure, ownedItems });
    
    if (!hasAku) {
        alert('错误：未拥有阿酷');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    akuUserFishData = getUserLatestFish();
    
    if (!akuUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', akuUserFishData);
    
    // 设置对话序列
    akuDialogueSequence = [
        {
            speaker: 'aku',
            message: '我观察你半天了，你躲避水流的身法还不错，看来有点本事。正好我新练了一招水流结界，要不要和我切磋一下？',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '水流结界听起来很厉害，切磋可以，不过咱们点到为止，别伤了和气。',
            delay: 2000
        },
        {
            speaker: 'aku',
            message: '放心，我有分寸。你看好了！说着指尖凝聚出一小团水流，落地瞬间形成透明结界，稳稳罩住一块小石子，这就是我的水流结界，能防能攻。',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '这招式确实精妙，你练了很久吧？',
            delay: 2000
        },
        {
            speaker: 'aku',
            message: '断断续续练了半个多月，刚开始总控制不好力度，要么结界太脆，要么力道太大冲坏珊瑚。等下切磋，我会收着力道，你要是吃力随时喊停。',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '好，那我就跟你好好交流一下技巧。',
            delay: 2000
        },
        {
            speaker: 'aku',
            message: '这才对！你的实力还不错，以后遇到搞不定的对手，随时找我，我陪你练练，还能帮你改良招式！',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupAkuUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindAkuAdventureEvents();
    
    // 重置状态
    currentAkuDialogueIndex = 0;
    akuDialogueActive = true;
    
    // 显示对话容器
    const dialogueContainer = document.querySelector('.aku-dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextAkuDialogue();
}

// 绑定阿酷冒险场景事件
function bindAkuAdventureEvents() {
    console.log('绑定阿酷冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextAkuDialogue');
    const skipBtn = document.getElementById('skipAkuAdventure');
    const seaBtn = document.getElementById('goToSeaFromAkuAdventure');
    
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
        newNextBtn.addEventListener('click', showNextAkuDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipAkuAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeAkuAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在阿酷场景中
function setupAkuUserFishInScene() {
    const userFishContainer = document.querySelector('.aku-character-user-fish');
    const akuContainer = document.querySelector('.aku-character-aku');
    
    if (!userFishContainer || !akuContainer || !akuUserFishData) {
        console.error('阿酷场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    akuContainer.innerHTML = '';
    
    // 创建阿酷图片和名字
    const akuImg = document.createElement('img');
    akuImg.src = 'assets/aku.png';
    akuImg.alt = '阿酷';
    akuImg.className = 'adventure-character';
    akuImg.style.objectFit = 'contain';
    
    const akuName = document.createElement('div');
    akuName.className = 'character-name';
    akuName.textContent = '阿酷';
    
    akuContainer.appendChild(akuImg);
    akuContainer.appendChild(akuName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (akuUserFishData.imgSrc && akuUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = akuUserFishData.imgSrc;
    } else {
        userFishImg.src = akuUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = akuUserFishData.name;
    userFishImg.className = 'adventure-character';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = akuUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('阿酷场景角色已添加到场景');
}

// 显示阿酷下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextAkuDialogue() {
    console.log('显示阿酷下一个对话，当前索引:', currentAkuDialogueIndex);
    
    if (!akuDialogueActive) return;
    
    if (currentAkuDialogueIndex >= akuDialogueSequence.length) {
        console.log('阿酷对话已结束，进入海洋');
        completeAkuDialogue();
        return;
    }
    
    const dialogue = akuDialogueSequence[currentAkuDialogueIndex];
    console.log('当前阿酷对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = akuDialogueSequence.slice(0, currentAkuDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('阿酷最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.aku-dialogue-container');
    if (!dialogueContainer) {
        console.error('阿酷对话容器缺失');
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
            const isAku = dialogueItem.speaker === 'aku';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isAku ? 'dialogue-box spongebob-dialogue aku-dialogue-left' : 'dialogue-box userfish-dialogue aku-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isAku ? '阿酷' : (akuUserFishData ? akuUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isAku) {
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
    
    currentAkuDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentAkuDialogueIndex >= akuDialogueSequence.length) {
        console.log('阿酷对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextAkuDialogue');
        const skipBtn = document.getElementById('skipAkuAdventure');
        const seaBtn = document.getElementById('goToSeaFromAkuAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completeAkuDialogue();
        }, 3000);
    }
}

// 完成阿酷对话
function completeAkuDialogue() {
    if (!akuDialogueActive) return;
    akuDialogueActive = false;
    
    console.log('完成阿酷对话序列');
    
    const akuDialogue = document.querySelector('.aku-dialogue-left');
    const userfishDialogue = document.querySelector('.aku-dialogue-right');
    
    if (akuDialogue) akuDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextAkuDialogue');
    const skipBtn = document.getElementById('skipAkuAdventure');
    const seaBtn = document.getElementById('goToSeaFromAkuAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('阿酷对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completeAkuAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过阿酷冒险
function skipAkuAdventure() {
    console.log('跳过阿酷冒险');
    if (confirm('确定要跳过阿酷的冒险吗？')) {
        completeAkuAdventure();
        goTo('sea');
    }
}

// 完成阿酷冒险
function completeAkuAdventure() {
    console.log('完成阿酷冒险');
    
    // 标记冒险已完成
    localStorage.setItem('akuAdventureCompleted', 'true');
    
    // 确保阿酷在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const akuFish = fishes.find(fish => fish && fish.id === 'store_aku');
        if (akuFish) {
            akuFish.hidden = false;
            // 更新阿酷的故事，使其包含特殊对话
            akuFish.story = '你的身手还不错！以后遇到搞不定的对手，随时找我切磋，我还能帮你改良招式！';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('阿酷冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化阿酷冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 阿酷冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是阿酷冒险场景，延迟初始化
            if (name === 'akuAdventure') {
                setTimeout(() => {
                    initAkuAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                akuAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在阿酷冒险场景
    const adventureScreen = document.getElementById('akuAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在阿酷冒险场景，初始化...');
        setTimeout(() => {
            initAkuAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initAkuAdventure = initAkuAdventure;
window.goToAkuAdventure = function() {
    goTo('akuAdventure');
};

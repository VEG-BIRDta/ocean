// ========== 双面龟冒险场景逻辑 ==========

let currentShuangmianguiDialogueIndex = 0;
let shuangmianguiUserFishData = null;
let shuangmianguiDialogueSequence = [];
let shuangmianguiDialogueActive = false;
let shuangmianguiAdventureInitialized = false;

// 初始化双面龟冒险场景
function initShuangmianguiAdventure() {
    if (shuangmianguiAdventureInitialized) return;
    shuangmianguiAdventureInitialized = true;
    
    console.log('初始化双面龟冒险场景...');
    
    // 安全检查：必须拥有双面龟且未完成冒险
    const hasShuangmiangui = ownedItems && ownedItems.includes('shuangmiangui');
    const hasCompletedAdventure = localStorage.getItem('shuangmianguiAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasShuangmiangui, hasCompletedAdventure, ownedItems });
    
    if (!hasShuangmiangui) {
        alert('错误：未拥有双面龟');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    shuangmianguiUserFishData = getUserLatestFish();
    
    if (!shuangmianguiUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', shuangmianguiUserFishData);
    
    // 设置对话序列
    shuangmianguiDialogueSequence = [
        {
            speaker: 'shuangmiangui',
            message: '那、那个… 能打扰你一下吗？我有件事想请你帮忙，可我又怕你嫌我麻烦…',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '你别紧张，有什么事尽管说，能帮的我肯定帮。',
            delay: 2000
        },
        {
            speaker: 'shuangmiangui',
            message: '谢谢你！我刚才找食物的时候，把奶奶留给我的祖传小贝壳弄丢了，它是淡粉色带银纹的，还会发 "叮咚" 声，就在东边碎石滩附近，可我胆子小，不敢一个人去找…',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '祖传的贝壳肯定很重要，我陪你一起去碎石滩找，肯定能找回来的！',
            delay: 2000
        },
        {
            speaker: 'shuangmiangui',
            message: '真的吗？太谢谢你了！我会用我的龟壳帮你挡水流，要是遇到小碎石滚落，我也能帮你拦住！等找到贝壳，我还请你吃我珍藏的海草！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '不用这么客气，互相帮忙是应该的，我们现在就出发吧！',
            delay: 2000
        },
        {
            speaker: 'shuangmiangui',
            message: '嗯嗯！有你在，我一点都不害怕了！以后要是有人欺负你，我就算拼了龟壳也会保护你！',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupShuangmianguiUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindShuangmianguiAdventureEvents();
    
    // 重置状态
    currentShuangmianguiDialogueIndex = 0;
    shuangmianguiDialogueActive = true;
    
    // 显示对话容器
    const dialogueContainer = document.querySelector('.shuangmiangui-dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextShuangmianguiDialogue();
}

// 绑定双面龟冒险场景事件
function bindShuangmianguiAdventureEvents() {
    console.log('绑定双面龟冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextShuangmianguiDialogue');
    const skipBtn = document.getElementById('skipShuangmianguiAdventure');
    const seaBtn = document.getElementById('goToSeaFromShuangmianguiAdventure');
    
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
        newNextBtn.addEventListener('click', showNextShuangmianguiDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipShuangmianguiAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeShuangmianguiAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在双面龟场景中
function setupShuangmianguiUserFishInScene() {
    const userFishContainer = document.querySelector('.shuangmiangui-character-user-fish');
    const shuangmianguiContainer = document.querySelector('.shuangmiangui-character-shuangmiangui');
    
    if (!userFishContainer || !shuangmianguiContainer || !shuangmianguiUserFishData) {
        console.error('双面龟场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    shuangmianguiContainer.innerHTML = '';
    
    // 创建双面龟图片和名字
    const shuangmianguiImg = document.createElement('img');
    shuangmianguiImg.src = 'assets/shuangmiangui.png';
    shuangmianguiImg.alt = '双面龟';
    shuangmianguiImg.className = 'adventure-character';
    shuangmianguiImg.style.objectFit = 'contain';
    
    const shuangmianguiName = document.createElement('div');
    shuangmianguiName.className = 'character-name';
    shuangmianguiName.textContent = '双面龟';
    
    shuangmianguiContainer.appendChild(shuangmianguiImg);
    shuangmianguiContainer.appendChild(shuangmianguiName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (shuangmianguiUserFishData.imgSrc && shuangmianguiUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = shuangmianguiUserFishData.imgSrc;
    } else {
        userFishImg.src = shuangmianguiUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = shuangmianguiUserFishData.name;
    userFishImg.className = 'adventure-character';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = shuangmianguiUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('双面龟场景角色已添加到场景');
}

// 显示双面龟下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextShuangmianguiDialogue() {
    console.log('显示双面龟下一个对话，当前索引:', currentShuangmianguiDialogueIndex);
    
    if (!shuangmianguiDialogueActive) return;
    
    if (currentShuangmianguiDialogueIndex >= shuangmianguiDialogueSequence.length) {
        console.log('双面龟对话已结束，进入海洋');
        completeShuangmianguiDialogue();
        return;
    }
    
    const dialogue = shuangmianguiDialogueSequence[currentShuangmianguiDialogueIndex];
    console.log('当前双面龟对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = shuangmianguiDialogueSequence.slice(0, currentShuangmianguiDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('双面龟最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.shuangmiangui-dialogue-container');
    if (!dialogueContainer) {
        console.error('双面龟对话容器缺失');
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
            const isShuangmiangui = dialogueItem.speaker === 'shuangmiangui';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isShuangmiangui ? 'dialogue-box spongebob-dialogue shuangmiangui-dialogue-left' : 'dialogue-box userfish-dialogue shuangmiangui-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isShuangmiangui ? '双面龟' : (shuangmianguiUserFishData ? shuangmianguiUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isShuangmiangui) {
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
    
    currentShuangmianguiDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentShuangmianguiDialogueIndex >= shuangmianguiDialogueSequence.length) {
        console.log('双面龟对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextShuangmianguiDialogue');
        const skipBtn = document.getElementById('skipShuangmianguiAdventure');
        const seaBtn = document.getElementById('goToSeaFromShuangmianguiAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completeShuangmianguiDialogue();
        }, 3000);
    }
}

// 完成双面龟对话
function completeShuangmianguiDialogue() {
    if (!shuangmianguiDialogueActive) return;
    shuangmianguiDialogueActive = false;
    
    console.log('完成双面龟对话序列');
    
    const shuangmianguiDialogue = document.querySelector('.shuangmiangui-dialogue-left');
    const userfishDialogue = document.querySelector('.shuangmiangui-dialogue-right');
    
    if (shuangmianguiDialogue) shuangmianguiDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextShuangmianguiDialogue');
    const skipBtn = document.getElementById('skipShuangmianguiAdventure');
    const seaBtn = document.getElementById('goToSeaFromShuangmianguiAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('双面龟对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completeShuangmianguiAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过双面龟冒险
function skipShuangmianguiAdventure() {
    console.log('跳过双面龟冒险');
    if (confirm('确定要跳过双面龟的冒险吗？')) {
        completeShuangmianguiAdventure();
        goTo('sea');
    }
}

// 完成双面龟冒险
function completeShuangmianguiAdventure() {
    console.log('完成双面龟冒险');
    
    // 标记冒险已完成
    localStorage.setItem('shuangmianguiAdventureCompleted', 'true');
    
    // 确保双面龟在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const shuangmianguiFish = fishes.find(fish => fish && fish.id === 'store_shuangmiangui');
        if (shuangmianguiFish) {
            shuangmianguiFish.hidden = false;
            // 更新双面龟的故事，使其包含特殊对话
            shuangmianguiFish.story = '那、那个… 谢谢你帮过我！以后要是有人欺负你，我就算拼了龟壳也会保护你！';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('双面龟冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化双面龟冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 双面龟冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是双面龟冒险场景，延迟初始化
            if (name === 'shuangmianguiAdventure') {
                setTimeout(() => {
                    initShuangmianguiAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                shuangmianguiAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在双面龟冒险场景
    const adventureScreen = document.getElementById('shuangmianguiAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在双面龟冒险场景，初始化...');
        setTimeout(() => {
            initShuangmianguiAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initShuangmianguiAdventure = initShuangmianguiAdventure;
window.goToShuangmianguiAdventure = function() {
    goTo('shuangmianguiAdventure');
};

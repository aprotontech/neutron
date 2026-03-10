<template>
  <div class="image-gallery" :class="{ 'android-native-app': isAndroidApp }">
    <!-- 同步状态对话框 -->
    <div v-if="showSyncDialog" class="sync-dialog-overlay" @click.self="closeSyncDialog">
      <div class="sync-dialog">
        <div class="sync-dialog-header">
          <h3>数据同步中</h3>
        </div>
        <div class="sync-dialog-content">
          <div class="sync-progress">
            <div class="sync-progress-text">
              {{ syncProgressText }}
            </div>
            <div class="sync-progress-bar">
              <div class="sync-progress-fill" :style="{ width: syncProgress + '%' }"></div>
            </div>
          </div>
          <div class="sync-info">
            同步完成后可以获取更好的体验，是否等待？
          </div>
        </div>
        <div class="sync-dialog-actions">
          <button class="sync-btn sync-btn-cancel" @click="handleCancelSync">
            取消
          </button>
          <button class="sync-btn sync-btn-wait" @click="handleWaitForSync">
            等待同步完成
          </button>
        </div>
      </div>
    </div>
    
    <!-- 顶部工具栏（移动设备显示） -->
    <div class="gallery-tools mobile-only" v-if="!isViewingMedia" @click.stop>
      <div class="dropdown">
        <button class="menu-btn" @click.stop="toggleMenu">⋮</button>
        <div class="menu" v-if="menuOpen">
          <button 
            class="menu-item" 
            :class="{ disabled: false }"
            @click="setSortOrder('mtime')"
          >
            <span class="menu-check" aria-hidden="true">{{ sortOrder === 'mtime' ? '✓' : '' }}</span>
            按最近添加排序
          </button>
          <button 
            class="menu-item" 
            :class="{ disabled: false }"
            @click="setSortOrder('etime')"
          >
            <span class="menu-check" aria-hidden="true">{{ sortOrder === 'etime' ? '✓' : '' }}</span>
            按拍摄日期排序
          </button>
          <button class="menu-item" @click="setFilter('images')">
            <span class="menu-check" aria-hidden="true">{{ filterType === 'images' ? '✓' : '' }}</span>
            只显示图片
          </button>
          <button class="menu-item" @click="setFilter('videos')">
            <span class="menu-check" aria-hidden="true">{{ filterType === 'videos' ? '✓' : '' }}</span>
            只显示视频
          </button>
        </div>
      </div>
    </div>
    
    <!-- 悬浮分组工具栏 -->
    <div 
      class="floating-group-toolbar" 
      :class="[
        {
          visible: (!isViewingMedia && isNativePlatform && allHistorySynced) && (
            groupType != 'all' || showGroupToolbar)
        },
        `group-type-${groupType}`
      ]"
      @mouseenter="handleToolbarMouseEnter"
      @mouseleave="handleToolbarMouseLeave"
    >
      <div class="group-toolbar-content">
        <button 
          class="group-btn" 
          :class="{ active: groupType === 'all' }"
          @click="setGroupType('all')"
        >
          全部
        </button>
        <button 
          class="group-btn" 
          :class="{ active: groupType === 'year' }"
          @click="setGroupType('year')"
        >
          年
        </button>
        <button 
          class="group-btn" 
          :class="{ active: groupType === 'month' }"
          @click="setGroupType('month')"
        >
          月
        </button>
      </div>
    </div>
    
    <!-- 图库内容 -->
    <div class="gallery-content" ref="scrollContainer">
      <!-- 分组显示 -->
      <div v-if="groupType !== 'all' && groups.length > 0" class="group-grid">
        <div 
          v-for="group in groups" 
          :key="group.time" 
          class="group-grid-item"
          @click="handleGroupClick(group)"
        >
          <div class="group-thumbnail">
            <img 
              v-if="group.imgUrl" 
              :src="group.imgUrl" 
              :alt="group.time"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="group-placeholder">
              <span class="group-icon">📅</span>
            </div>
            <div class="group-overlay">
              <div class="group-time">{{ group.time }}</div>
              <div class="group-count">{{ getGroupCount(group.time) }} {{ group.count }} 张</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 图片网格（全部显示） -->
      <div v-else class="image-grid">
        <div 
          v-for="(image, index) in images" 
          :key="image.id" 
          class="image-grid-item"
          :data-index="index"
          :ref="el => observeEl(el, index)"
          @click="handleImageClick(image)"
          v-show="matchesFilter(image)"
        >
          <div class="image-thumbnail">
            <img 
              v-if="image.thumbnailUrl" 
              :src="image.thumbnailUrl" 
              :alt="image.name"
              loading="eager"
              decoding="async"
              fetchpriority="low"
              @load="image.loaded = true"
            />
            <div v-else class="image-placeholder">
              <span class="image-icon">{{ image.type === '视频' ? '🎬' : '🖼️' }}</span>
            </div>
            <!-- 视频文件播放按钮 -->
            <div v-if="image.type === '视频'" class="video-play-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="white" fill-opacity="0.8"/>
              </svg>
            </div>
            <!-- 视频时长显示 -->
            <div v-if="image.type === '视频' && image.duration" class="video-duration">
              {{ image.duration }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载更多指示器 -->
      <div v-if="loading" class="loading-more">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      
      <div v-if="!hasMore && images.length > 0" class="no-more">
        没有更多图片了
      </div>

      <!-- spacer 用于根据 total 预填充滚动条（仅在全部图片模式下使用） -->
      <div v-if="groupType === 'all'" :style="{ height: spacerHeight + 'px' }"></div>
    </div>

    <!-- 媒体预览组件（独立 Preview.vue） -->
    <Preview
      v-model="isViewingMedia"
      :total-count="imageFiles.length"
      :initial-offset="currentMediaIndex"
      :initial-items="previewInitialItems"
      :file-api="fileAPI"
      :fetch-nearby="fetchNearbyForPreview"
    />

    <!-- 空状态 -->
    <div v-if="!loading && images.length === 0" class="empty-state">
      <div class="empty-icon">🖼️</div>
      <h3>暂无图片</h3>
      <p>图库中还没有图片，请上传或同步图片</p>
      <button class="empty-action-btn" @click="refreshGallery">
        刷新图库
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { Capacitor } from '@capacitor/core'
import FileAPI from './lib/file-api.js'
import BatchFileApi from './lib/batch.js'
import { FileTypeDetector, VideoDurationFormatter } from './lib/helpers.js'
import Preview from './Preview.vue'

// --- 简化后的实现，专注于：分页列表、IntersectionObserver 缩略图预加载、预览下滑关闭 ---

const isAndroidApp = ref(false)
const fileAPI = FileAPI.getInstance()

const scrollContainer = ref(null)
const images = ref([])
const totalImages = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const currentOffset = ref(0)
const pageSize = 30

const intersectionObserver = ref(null)
const observedElements = new Map()

// menu / filter state (mobile)
const menuOpen = ref(false)
const filterType = ref('all') // 'all' | 'images' | 'videos'

// 排序状态
const sortOrder = ref('etime') // 'mtime' | 'etime' - 默认按最近添加排序
const allHistorySynced = ref(false) // 是否所有历史记录已同步

// 分组状态
const groupType = ref('all') // 'all' | 'year' | 'month' - 默认显示全部
const groups = ref([]) // 分组数据
const loadingGroups = ref(false) // 是否正在加载分组数据
const isNativePlatform = Capacitor.isNativePlatform() // 是否在原生平台

// 滚动检测状态
const showGroupToolbar = ref(false) // 是否显示分组工具栏
const scrollThreshold = 100 // 滚动多少像素后显示工具栏
let scrollTimeout = null // 隐藏工具栏的定时器
const toolbarHideDelay = 2000 // 工具栏自动隐藏延迟（毫秒）

// 保存全部图像列表的滚动位置
const allImagesScrollTop = ref(0)

// 同步状态对话框
const showSyncDialog = ref(false) // 是否显示同步对话框
const syncProgress = ref(0) // 同步进度百分比
const syncProgressText = ref('正在检查同步状态...') // 同步进度文本
const userChoiceMade = ref(false) // 用户是否已做出选择
const waitingForSync = ref(false) // 用户是否选择等待同步完成

function toggleMenu() { menuOpen.value = !menuOpen.value }
function setFilter(val) {
  if (filterType.value === val) filterType.value = 'all'
  else filterType.value = val
  menuOpen.value = false
  // 重新加载图片以应用新的过滤条件
  refreshGallery();
}

// 设置排序方式
function setSortOrder(order) {
  sortOrder.value = order;
  menuOpen.value = false;
  // 重新加载图片
  refreshGallery();
}


function matchesFilter(image) {
  if (!filterType.value || filterType.value === 'all') return true
  if (filterType.value === 'images') return image.type === '图片'
  if (filterType.value === 'videos') return image.type === '视频'
  return true
}

// Preview state（预览由 Preview.vue 负责，此处仅保留打开时传给 Preview 的数据）
const isViewingMedia = ref(false)
const imageFiles = ref([])
const currentMediaIndex = ref(-1)
const lastTouchHandledAt = ref(0)

// 传给 Preview 的初始列表（offset + filepath, thumbnailUrl, name, type）
const previewInitialItems = computed(() => {
  return imageFiles.value.map((f, i) => ({
    offset: i,
    path: f.path,
    thumbnailUrl: f.thumbnailUrl,
    name: f.name,
    type: f.type
  }))
})

// Preview 滑动时按需拉取附近列表的回调
function fetchNearbyForPreview(offset, count) {
  const list = imageFiles.value
  const start = Math.max(0, offset)
  const end = Math.min(list.length, offset + count)
  const slice = list.slice(start, end)
  return Promise.resolve(
    slice.map((f, i) => ({
      offset: start + i,
      path: f.path,
      thumbnailUrl: f.thumbnailUrl,
      name: f.name,
      type: f.type
    }))
  )
}

// layout estimation for scrollbar prefill
const itemHeight = 100 // 与样式中一致（调整为更紧凑的 iOS 风格）
const columns = ref(1)

// 设置分组类型
async function setGroupType(type) {
  if (groupType.value === type) return;
  
  // 保存当前的滚动位置
  if (scrollContainer.value) {
    if (groupType.value === 'all') {
      // 如果当前是全部模式，保存滚动位置到变量
      allImagesScrollTop.value = scrollContainer.value.scrollTop;
    }
  }
  
  groupType.value = type;
  
  // 根据分组类型重新初始化IntersectionObserver
  initObserver();
  
  if (type === 'all') {
    // 切换到全部显示模式
    if (images.value.length === 0) {
      refreshGallery();
    } else {
      // 恢复保存的滚动位置
      nextTick(() => {
        if (scrollContainer.value) {
          scrollContainer.value.scrollTop = allImagesScrollTop.value;
        }
        // 重新附加观察器
        attachObservers();
      });
    }
  } else {
    // 切换到分组显示模式，重置滚动条到顶部
    await loadGroups(type);
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0;
      }
    });
  }
}

// 加载分组数据
async function loadGroups(type) {
  if (!isNativePlatform || !allHistorySynced.value) {
    console.log('非原生平台或历史记录未同步完成，无法加载分组数据');
    return;
  }

  loadingGroups.value = true;
  try {
    // 获取分组数据
    groups.value = await fileAPI.getImageGroup(type, sortOrder.value);
    console.log(`加载了 ${groups.value.length} 个${type === 'year' ? '年' : '月'}分组`);

    // 如果分组数据为空，直接返回
    if (groups.value.length === 0) {
      return;
    }

    // 使用BatchFileApi批量获取分组封面的图片URL（使用异步模式）
    const batchFileApi = new BatchFileApi(fileAPI);
    
    // 准备批量获取的图片路径列表
    const filePathList = groups.value.map(group => ({
      filePath: group.file_path,
      locals: ['raw', '800', '400', '200'],
      remote: '800'
    }));

    // 批量获取图片URL（使用异步模式）
    const batchResults = await batchFileApi.getFilesUrl(filePathList, true);
    
    // 将获取到的图片URL设置到分组数据中
    groups.value.forEach((group, index) => {
      const result = batchResults[index];
      if (result && result.url) {
        // 如果有缓存的URL，直接使用
        group.imgUrl = result.url;
        console.log(`分组 ${group.time} 封面图片URL从缓存获取成功: ${result.url.substring(0, 50)}...`);
      } else if (result && result.fetchPromise) {
        // 如果需要异步获取，设置占位符并开始异步获取
        group.imgUrl = ''; // 先设置为空，显示占位符
        group.fetchPromise = result.fetchPromise;
        
        // 异步获取图片URL
        result.fetchPromise.then(remoteResult => {
          if (remoteResult && remoteResult.url) {
            group.imgUrl = remoteResult.url;
            console.log(`分组 ${group.time} 封面图片URL异步获取成功: ${remoteResult.url.substring(0, 50)}...`);
          } else {
            console.warn(`分组 ${group.time} 封面图片URL异步获取失败:`, remoteResult?.error || '未知错误');
          }
        }).catch(error => {
          console.error(`分组 ${group.time} 封面图片URL异步获取异常:`, error);
        });
        
        console.log(`分组 ${group.time} 封面图片URL开始异步获取`);
      } else {
        console.warn(`分组 ${group.time} 封面图片URL获取失败:`, result?.error || '未知错误');
        group.imgUrl = ''; // 保持为空，显示占位符
      }
    });

    console.log(`批量获取了 ${groups.value.filter(g => g.imgUrl).length}/${groups.value.length} 个分组封面图片URL，${groups.value.filter(g => g.fetchPromise).length} 个正在异步获取`);
  } catch (error) {
    console.error('加载分组数据失败:', error);
    groups.value = [];
  } finally {
    loadingGroups.value = false;
  }
}

// 获取分组中的图片数量
function getGroupCount(groupTime) {
  // 根据分组类型和时间估算图片数量
  // 这里可以根据实际数据计算，目前先返回一个估算值
  
  if (!groupTime) return '多';
  
  // 如果是按年分组（如 "2024"）
  if (/^\d{4}$/.test(groupTime)) {
    // 根据年份估算：越近的年份可能图片越多
    const currentYear = new Date().getFullYear();
    const year = parseInt(groupTime);
    const yearDiff = currentYear - year;
    
    if (yearDiff === 0) return '今年';
    if (yearDiff === 1) return '去年';
    if (yearDiff <= 5) return '近期';
    return '往年';
  }
  
  // 如果是按月分组（如 "2024-01"）
  if (/^\d{4}-\d{2}$/.test(groupTime)) {
    const [year, month] = groupTime.split('-').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (year === currentYear && month === currentMonth) return '本月';
    if (year === currentYear && month === currentMonth - 1) return '上月';
    if (year === currentYear) return '今年';
    return '往年';
  }
  
  return '多';
}

// 处理分组点击
function handleGroupClick(group) {
  console.log(`点击分组: ${group.time}, offset: ${group.offset}`);
  
  // 切换到全部显示模式
  groupType.value = 'all';
  
  // 滚动到该分组的第一张图片位置
  if (scrollContainer.value && group.offset !== undefined) {
    // 计算目标位置
    const targetIndex = Math.max(0, Math.min(group.offset, images.value.length - 1));
    
    // 确保图片已加载到目标位置附近
    if (targetIndex >= images.value.length - pageSize) {
      // 如果需要，加载更多图片
      loadImages(images.value.length);
    }
    
    // 滚动到目标位置 - 直接设置scrollTop，没有动画
    nextTick(() => {
      // 方法1：尝试通过data-index属性查找元素
      const targetElement = document.querySelector(`.image-grid-item[data-index="${targetIndex}"]`);
      if (targetElement) {
        // 使用scrollIntoView但禁用动画
        targetElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        // 方法2：如果找不到元素，使用估算的滚动位置
        // 每个图片项大约100px高度，加上4px的间隙
        const itemHeightWithGap = 104; // 100px高度 + 4px间隙
        const targetScrollTop = targetIndex * itemHeightWithGap;
        scrollContainer.value.scrollTop = targetScrollTop;
      }
    });
  }
}

const spacerHeight = computed(() => {
  const remaining = Math.max(0, (totalImages.value || 0) - images.value.length)
  const cols = Math.max(1, columns.value)
  const rows = Math.ceil(remaining / cols)
  return rows * itemHeight
})

// 分组列表的spacer高度
const groupSpacerHeight = computed(() => {
  // 分组项高度（包括间距）
  const groupItemHeight = 300 + 16; // group-thumbnail高度 + gap
  // 计算分组列表的总高度
  return groups.value.length * groupItemHeight;
})

function getFileType(filename) {
  if (FileTypeDetector.isImage(filename)) return '图片'
  if (FileTypeDetector.isVideo(filename)) return '视频'
  return '文件'
}

function updateColumns() {
  if (!scrollContainer.value) return
  const width = scrollContainer.value.clientWidth || window.innerWidth
  const colWidth = 120 // min item width from CSS
  columns.value = Math.max(1, Math.floor(width / colWidth))
}

function initObserver() {
  if (intersectionObserver.value) intersectionObserver.value.disconnect()

  // 仅在全部图片模式下初始化IntersectionObserver
  if (groupType.value === 'all') {
    // 扩大 rootMargin，快速滑动时提前加载，减少白屏
    intersectionObserver.value = new IntersectionObserver(handleIntersection, {
      root: scrollContainer.value,
      rootMargin: '400px 0px',
      threshold: 0.01
    })
  }
}

// 初始化滚动事件监听
function initScrollListener() {
  if (!scrollContainer.value) return
  
  // 添加滚动事件监听
  scrollContainer.value.addEventListener('scroll', handleScroll)
  
  // 添加鼠标移动事件监听（用于重置隐藏定时器）
  scrollContainer.value.addEventListener('mousemove', handleMouseMove)
  scrollContainer.value.addEventListener('touchmove', handleMouseMove)
}

// 处理滚动事件
function handleScroll() {
  if (!scrollContainer.value) return
  
  const scrollTop = scrollContainer.value.scrollTop
  
  // 如果滚动距离超过阈值，显示工具栏
  if (scrollTop > scrollThreshold) {
    showGroupToolbar.value = true
    resetToolbarHideTimer()
  } else {
    // 如果滚动到顶部，隐藏工具栏
    showGroupToolbar.value = false
    clearToolbarHideTimer()
  }
}

// 处理鼠标/触摸移动事件
function handleMouseMove() {
  // 当用户与内容交互时，重置隐藏定时器
  if (showGroupToolbar.value) {
    resetToolbarHideTimer()
  }
}

// 重置工具栏隐藏定时器
function resetToolbarHideTimer() {
  clearToolbarHideTimer()
  scrollTimeout = setTimeout(() => {
    showGroupToolbar.value = false
  }, toolbarHideDelay)
}

// 清除工具栏隐藏定时器
function clearToolbarHideTimer() {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
    scrollTimeout = null
  }
}

// 当工具栏可见时，鼠标移入停止隐藏
function handleToolbarMouseEnter() {
  clearToolbarHideTimer()
}

// 当工具栏可见时，鼠标移出重新开始隐藏计时
function handleToolbarMouseLeave() {
  if (showGroupToolbar.value) {
    resetToolbarHideTimer()
  }
}

function handleIntersection(entries) {
  // 仅在全部图片模式下处理IntersectionObserver
  if (groupType.value !== 'all') return;
  
  entries.forEach(entry => {
    const el = entry.target
    const idx = parseInt(el.dataset.index, 10)
    if (!Number.isFinite(idx)) return

    if (entry.isIntersecting) {
      // load thumbnail for visible items
      const img = images.value[idx]
      if (img && !img.thumbnailUrl && !img.loadingThumbnail) {
        loadThumbnail(img, idx)
      }

      // if last item visible, load next page
      if (idx === images.value.length - 1 && !loading.value && hasMore.value) {
        loadImages(currentOffset.value)
      }
    }
  })
}

function observeEl(el, idx) {
  if (!el) return
  el.dataset.index = String(idx)
  // always cache element; observer may be initialized later
  observedElements.set(idx, el)
  // 仅在全部图片模式下使用IntersectionObserver
  if (groupType.value === 'all' && intersectionObserver.value) {
    intersectionObserver.value.observe(el)
  }
}

async function loadImages(offset = 0) {
  if (loading.value) return
  loading.value = true
  try {

    const res = await fileAPI.getImageRepo(offset, pageSize, sortOrder.value)
    if (!res) return

    const items = res.items || []
    const mapped = items.map((it, i) => {
      const path = typeof it === 'string' ? it : (it.file_path || it)
      const name = (path || '').split('/').pop() || '未命名'
      return {
        id: offset + i,
        path,
        name,
        type: getFileType(name),
        thumbnailUrl: null,
        loadingThumbnail: false
      }
    })

    if (offset === 0) images.value = mapped
    else images.value = images.value.concat(mapped)

    totalImages.value = res.total || totalImages.value || 0
    currentOffset.value = images.value.length
    hasMore.value = currentOffset.value < totalImages.value

    // 检查历史记录是否已同步完成
    if (isNativePlatform && !allHistorySynced.value) {
      // 使用与FileAPI相同的逻辑判断同步状态
      // 当有本地数据且知道远程总数时，就认为可以显示分组功能
      // 不需要等到所有图片都加载完成
      if (images.value.length > 0 && totalImages.value > 0) {
        allHistorySynced.value = true;
        console.log('有本地数据，可以显示分组功能');
      }
    }

    // ensure observer is ready after DOM updated
    await nextTick()
    if (!intersectionObserver.value) initObserver()
    // attach observer to rendered nodes
    attachObservers()
  } catch (e) {
    console.error('loadImages error', e)
  } finally {
    loading.value = false
  }
}

function attachObservers() {
  const container = scrollContainer.value
  if (!container || !intersectionObserver.value) return
  const nodes = container.querySelectorAll('.image-grid-item')
  nodes.forEach((n, i) => {
    n.dataset.index = String(i)
    // 仅在全部图片模式下使用IntersectionObserver
    if (groupType.value === 'all') {
      intersectionObserver.value.observe(n)
    }
    observedElements.set(i, n)
  })
}

async function loadThumbnail(item, idx) {
  if (!item || item.loadingThumbnail || item.thumbnailUrl) return
  images.value[idx].loadingThumbnail = true
  try {
    const url = await fileAPI.getFileThumbnailUrl(item.path, 200)
    if (url) images.value[idx].thumbnailUrl = url
    
    // 如果是视频文件，获取文件信息以提取时长
    if (item.type === '视频' && !item.duration && !item.loadingFileInfo) {
      // 标记正在获取文件信息，避免重复请求
      images.value[idx].loadingFileInfo = true
      try {
        const fileInfo = await fileAPI.getFileInfo(item.path)
        
        if (fileInfo && fileInfo.exifData) {
          const duration = VideoDurationFormatter.getDurationFromExif(fileInfo.exifData)
          if (duration) {
            images.value[idx].duration = duration
          }
        }
      } catch (e) {
        // 忽略获取文件信息失败的情况
        console.warn('Failed to get file info for duration:', e)
      } finally {
        images.value[idx].loadingFileInfo = false
      }
    }
  } catch (e) {
    // ignore thumbnail load failures
  } finally {
    images.value[idx].loadingThumbnail = false
  }
}

function handleImageClick(file) {
  // prevent duplicate click fired after touchend handled the tap
  const now = Date.now()
  if (lastTouchHandledAt.value && (now - lastTouchHandledAt.value) < 600) {
    // recent touch already handled the tap
    lastTouchHandledAt.value = 0
    return
  }
  openMediaViewer(file)
}

function openMediaViewer(file) {
  imageFiles.value = images.value.filter(f => f.type === '图片' || f.type === '视频')
  currentMediaIndex.value = imageFiles.value.findIndex(f => f.path === file.path)
  if (currentMediaIndex.value < 0) currentMediaIndex.value = 0
  isViewingMedia.value = true
}

function refreshGallery() {
  currentOffset.value = 0
  hasMore.value = true
  images.value = []
  allHistorySynced.value = false // 重置同步状态
  
  // 重置滚动条到顶部
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0;
  }
  
  // 重新初始化IntersectionObserver
  initObserver();
  
  loadImages(0)
}

// 同步相关方法
async function checkSyncStatus() {
  if (!isNativePlatform || userChoiceMade.value) {
    return;
  }
  
  try {
    // 使用新的getImageSyncStatus函数获取同步状态
    const syncStatus = await fileAPI.getImageSyncStatus(handleSyncStatusChange);
    
    if (syncStatus.isNative) {
      // 更新同步进度显示
      syncProgress.value = syncStatus.progress;
      
      if (syncStatus.error) {
        syncProgressText.value = `同步错误: ${syncStatus.error}`;
      } else if (syncStatus.isSyncFinished) {
        syncProgressText.value = '同步完成！';
        allHistorySynced.value = true;
        
        // 同步完成后自动关闭对话框
        setTimeout(() => {
          closeSyncDialog();
        }, 1000);
      } else if (syncStatus.remoteCount > 0) {
        syncProgressText.value = `已同步 ${syncStatus.localCount}/${syncStatus.remoteCount} 张图片信息 (${syncStatus.progress}%)`;
      } else if (syncStatus.localCount > 0) {
        syncProgressText.value = `正在同步中... (${syncStatus.localCount} 张已同步)`;
      } else {
        syncProgressText.value = '正在检查同步状态...';
      }
      
      // 如果同步未完成且用户还没有做出选择，显示对话框
      if (!syncStatus.isSyncFinished && !userChoiceMade.value && !showSyncDialog.value) {
        showSyncDialog.value = true;
      }
    } else {
      // 非Native环境，不需要同步对话框
      syncProgressText.value = 'Web模式，无需同步';
      allHistorySynced.value = true;
    }
  } catch (error) {
    console.error('检查同步状态失败:', error);
    syncProgressText.value = '检查同步状态失败';
  }
}

// 同步状态变更回调函数
function handleSyncStatusChange(newStatus) {
  console.log('同步状态变更:', newStatus);
  
  // 更新本地状态
  if (newStatus.isNative) {
    syncProgress.value = newStatus.progress;
    
    if (newStatus.isSyncFinished) {
      syncProgressText.value = '同步完成！';
      allHistorySynced.value = true;
      
      // 同步完成后自动关闭对话框
      setTimeout(() => {
        closeSyncDialog();
      }, 1000);
    } else if (newStatus.remoteCount > 0) {
      syncProgressText.value = `已同步 ${newStatus.localCount}/${newStatus.remoteCount} 张图片信息 (${newStatus.progress}%)`;
      
      // 如果同步未完成且用户还没有做出选择，显示对话框
      if (!newStatus.isSyncFinished && !userChoiceMade.value && !showSyncDialog.value) {
        showSyncDialog.value = true;
      }
    } else if (newStatus.localCount > 0) {
      syncProgressText.value = `正在同步中... (${newStatus.localCount} 张已同步)`;
      
      // 如果同步未完成且用户还没有做出选择，显示对话框
      if (!newStatus.isSyncFinished && !userChoiceMade.value && !showSyncDialog.value) {
        showSyncDialog.value = true;
      }
    }
  }
}

// 关闭同步对话框
function closeSyncDialog() {
  showSyncDialog.value = false;
  userChoiceMade.value = true;
  waitingForSync.value = false;
}

// 处理取消同步
function handleCancelSync() {
  closeSyncDialog();
  // 用户可以继续使用应用，只是没有分组功能
  console.log('用户选择取消等待同步');
}

// 处理等待同步完成
function handleWaitForSync() {
  waitingForSync.value = true;
  syncProgressText.value = '等待同步完成...';
  console.log('用户选择等待同步完成');

  setTimeout(async() => {
    const syncStatus = await fileAPI.getImageSyncStatus();
    handleSyncStatusChange(syncStatus)
  }, 10)
}

// 开始同步状态检查
async function startSyncCheck() {
  if (!isNativePlatform || userChoiceMade.value) {
    return;
  }
  
  // 延迟检查，让页面先加载
  setTimeout(async () => {
    try {
      await checkSyncStatus();
    } catch (error) {
      console.error('启动同步检查失败:', error);
    }
  }, 200);
}

onMounted(() => {
  // close menu when clicking outside
  const onDocClick = () => { menuOpen.value = false }
  document.addEventListener('click', onDocClick)
  if (Capacitor.isNativePlatform && Capacitor.getPlatform && Capacitor.isNativePlatform()) {
    if (Capacitor.getPlatform() === 'android') {
      isAndroidApp.value = true
      // Android Native模式专用修复
      applyAndroidNativeFix()
    }
  }

  updateColumns()
  window.addEventListener('resize', updateColumns)

  // 如果是原生平台，启动同步状态检查
  if (isNativePlatform) {
    startSyncCheck();
  }

  // ensure template refs are populated before initializing observer
  nextTick(async () => {
    initObserver()
    initScrollListener() // 初始化滚动事件监听
    // if any elements were collected earlier, observe them now
    observedElements.forEach((el, idx) => {
      try {
        if (intersectionObserver.value && el) intersectionObserver.value.observe(el)
      } catch (e) {
        // ignore
      }
    })
    loadImages(0)
  })

  // cleanup doc click listener on unmount
  onUnmounted(() => {
    document.removeEventListener('click', onDocClick)
    window.removeEventListener('resize', updateColumns)
    
    // 清理滚动事件监听器
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener('scroll', handleScroll)
      scrollContainer.value.removeEventListener('mousemove', handleMouseMove)
      scrollContainer.value.removeEventListener('touchmove', handleMouseMove)
    }
    
    // 清理定时器
    clearToolbarHideTimer()
    
    // 清理IntersectionObserver
    if (intersectionObserver.value) {
      intersectionObserver.value.disconnect()
    }
  })
})


// Android Native模式专用修复
function applyAndroidNativeFix() {
  // 确保滚动容器有正确的高度
  nextTick(() => {
    if (scrollContainer.value) {
      // 确保容器可以滚动
      scrollContainer.value.style.webkitOverflowScrolling = 'touch'
      scrollContainer.value.style.overflowY = 'auto'
      scrollContainer.value.style.overflowX = 'hidden'
      
      // 添加触摸事件监听器以确保滚动工作
      scrollContainer.value.addEventListener('touchstart', function(e) {
        // 允许默认的滚动行为
      }, { passive: true })
      
      scrollContainer.value.addEventListener('touchmove', function(e) {
        // 允许默认的滚动行为
      }, { passive: true })
      
      // 确保容器有正确的高度
      const galleryEl = document.querySelector('.image-gallery')
      if (galleryEl) {
        galleryEl.style.height = '100vh'
        galleryEl.style.display = 'flex'
        galleryEl.style.flexDirection = 'column'
      }
      
      // 强制重绘以确保样式生效
      scrollContainer.value.style.display = 'none'
      scrollContainer.value.offsetHeight // 触发重绘
      scrollContainer.value.style.display = ''
    }
    
    // 添加全局触摸事件监听器，确保滚动不被阻止
    document.addEventListener('touchmove', function(e) {
      // 允许所有触摸移动事件
    }, { passive: true })
  })
  
  // 简化点击事件处理
  const originalHandleImageClick = handleImageClick
  handleImageClick = function(file) {
    // 直接调用原始函数，不进行复杂的防抖检查
    lastTouchHandledAt.value = 0
    originalHandleImageClick.call(this, file)
  }
  
  // 确保body和html元素有正确的样式
  nextTick(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100%'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.height = '100%'
  })
}


onUnmounted(() => {
  if (intersectionObserver.value) intersectionObserver.value.disconnect()
  window.removeEventListener('resize', updateColumns)
})
</script>

<style scoped>
.image-gallery {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  /* 与Files.vue保持一致，确保Native模式下滚动正常 */
  /* 移除overflow: hidden，允许内部容器滚动 */
  position: relative;
  overscroll-behavior: contain;
  touch-action: pan-y;
  box-sizing: border-box;
  /* 确保在Android WebView中正确工作 */
  -webkit-overflow-scrolling: touch;
}

/* Native模式下特别优化 */
.image-gallery.android-native-app {
  /* App.vue 已处理状态栏安全区；移除根容器的额外 top padding
     以避免内容与状态栏之间出现多余间隔。 */
  padding-top: 0;
  height: 100%;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

/* Native模式下增加分组网格的底部padding，确保最后一张图片不被遮挡 */
.image-gallery.android-native-app .group-grid {
  padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
}

/* Native模式下增加图片网格的底部padding，确保最后一张图片不被遮挡 */
.image-gallery.android-native-app .image-grid {
  padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
}

/* 紫色状态栏已移至App.vue中统一管理 */

.gallery-tools {
  display: flex;
  gap: 10px;
  position: fixed;
  right: 12px;
  top: 66px;
  z-index: 1100;
}

/* Android原生应用中，三点按钮需要考虑状态栏安全区 */
.image-gallery.android-native-app .gallery-tools {
  top: calc(16px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
}

.tool-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tool-icon {
  font-size: 16px;
}

.tool-text {
  font-size: 14px;
}

/* mobile-only helper */
.mobile-only { display: none }

.dropdown { position: relative }
.menu-btn {
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  font-size: 18px;
}
.menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  z-index: 1200;
}

/* Native: ensure dropdown doesn't collide with safe-area on right edge */
.image-gallery.android-native-app .dropdown .menu {
  right: calc(env(safe-area-inset-right, 0px));
}
.menu-item {
  padding: 12px 14px;
  text-align: left;
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
}
.menu-item:hover { background: #f5f5f5 }
.menu-item.disabled { color: #999; cursor: default; pointer-events: none }

@media (max-width: 768px) {
  .mobile-only { display: block }
}

/* Native: reduce extra top gap between status bar and gallery content */
.image-gallery.android-native-app .gallery-content {
  /* 仅保留一个小的内边距，使内容与头部有视觉间隔，
     不再重复应用 safe-area-inset（由 App.vue 处理）。 */
  padding-top: 6px;
  padding-left: 12px;
  padding-right: 12px;
}

.menu-check { display: inline-block; width: 20px; margin-right: 6px; color: #667eea; font-weight: 600 }

.gallery-content {
  flex: 1;
  padding: 20px;
  position: relative; /* make dropdown absolute positioning relative to content */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
  touch-action: pan-y; /* 允许垂直触摸滚动 */
  pointer-events: auto;
  overscroll-behavior: contain; /* 防止滚动链 */
  /* scroll-behavior: smooth; 移除平滑滚动，根据用户要求直接显示 */
  /* 确保触摸事件不会被阻止 */
  -webkit-touch-callout: none; /* 禁用长按菜单 */
  /* 移除will-change和contain，它们在某些情况下可能降低性能 */
  /* Android WebView优化 */
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-drag: none;
  /* 确保滚动容器有正确的高度 */
  min-height: 0; /* 重要：允许flex容器内的滚动 */
}

/* 网格视图样式 - iOS风格 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 4px; /* 稍微增大间隙以符合 iOS 风格 */
  /* 保留底部空间，避免被底部 Tab 遮挡（增加padding确保不被遮挡） */
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

.image-grid-item {
  background: transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  touch-action: pan-y;
  /* 简化过渡效果，提高性能 */
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
  user-select: none; /* 防止文本选择干扰触摸 */
  -webkit-user-drag: none; /* 防止拖动干扰 */
  /* 移除transform和backface-visibility，简化渲染 */
}

.image-grid-item:hover,
.image-grid-item:active {
  opacity: 0.9;
  /* 移除transform缩放，提高性能 */
}

.image-thumbnail {
  position: relative;
  width: 100%;
  height: 100px; /* 调整为更紧凑的行高，匹配 itemHeight */
  /* 优化渲染性能 */
  contain: content;
  will-change: transform; /* 仅在有动画时使用，这里移除 */
}

/* ensure image thumbnails fill the container and keep aspect ratio */
.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: auto;
  touch-action: pan-y;
}

/* 视频播放按钮样式 */
.image-thumbnail .video-play-button {
  position: absolute;
  bottom: 6px;
  left: 6px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}
.image-thumbnail .video-play-button:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}
.image-thumbnail .video-play-button svg {
  width: 16px;
  height: 16px;
  margin-left: 2px; /* 让播放三角形稍微向右偏移，看起来更居中 */
}

/* 视频时长显示样式 */
.image-thumbnail .video-duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: transparent;
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
  z-index: 10;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.3px;
  min-width: 36px;
  text-align: center;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-real {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.image-real img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 移除过渡效果，提高性能 */
}

/* 移除图片缩放效果，提高性能 */

.image-icon {
  font-size: 32px;
  opacity: 0.5;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-grid-item:hover .image-overlay {
  opacity: 1;
}

.image-name {
  display: block;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-type {
  display: block;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

.loading-more {
  text-align: center;
  padding: 20px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.action-btn {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #667eea;
  color: #667eea;
}

.action-icon {
  font-size: 14px;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 20px;
}

.empty-state p {
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.empty-action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 12px 30px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.empty-action-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 紫色状态栏已移至App.vue中统一管理 */
  
  .gallery-content {
    padding: 8px;
    /* 移动设备上优化触摸滚动 */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    overscroll-behavior: contain;
    /* 移动设备上进一步优化 */
    -webkit-tap-highlight-color: transparent;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 2px;
  }
  
  .image-thumbnail {
    height: 100px;
  }
  
  .preview-content {
    margin: 10px;
    max-height: 80vh;
  }
  
  .preview-image-container {
    padding: 20px;
    min-height: 200px;
  }
}

@media (max-width: 480px) {
  /* 紫色状态栏已移至App.vue中统一管理 */
  
  .gallery-content {
    padding: 4px;
    /* 小屏幕设备上进一步优化触摸滚动 */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    overscroll-behavior: contain;
    /* 小屏幕设备上特别优化 */
    -webkit-tap-highlight-color: transparent;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 1px;
  }
  
  .image-thumbnail {
    height: 80px;
  }
  
  .image-icon {
    font-size: 24px;
  }
  
  .gallery-tools {
    gap: 8px;
  }
  
  .tool-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .tool-icon {
    font-size: 14px;
  }
}

/* 下载进度显示样式 */
.download-progress-container {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.download-progress {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.download-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.download-progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.download-progress-text {
  font-weight: 500;
}

.download-progress-size {
  color: rgba(255, 255, 255, 0.7);
  font-family: monospace;
}

/* 详细进度信息样式 */
.download-progress-details {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  animation: fadeInUp 0.3s ease;
}

/* 悬浮分组工具栏样式 */
.floating-group-toolbar {
  position: fixed;
  bottom: 100px; /* 提高位置，避免与底部Tab导航太接近 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100; /* 提高z-index，确保在底部Tab导航之上 */
  background: rgba(255, 255, 255, 0.15); /* 改为更浅的半透明背景 */
  backdrop-filter: blur(20px); /* 增加模糊效果 */
  border-radius: 25px;
  padding: 10px 16px; /* 增加内边距，使按钮更大 */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 0; /* 默认隐藏 */
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none; /* 默认不可交互 */
}

/* 当工具栏可见时 */
.floating-group-toolbar.visible {
  opacity: 1;
  pointer-events: auto; /* 允许交互 */
  animation: fadeInUp 0.3s ease;
}

.group-toolbar-content {
  display: flex;
  gap: 8px;
}

.group-btn {
  background: rgba(255, 255, 255, 0.2); /* 增加按钮背景透明度 */
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95); /* 默认白色文字 */
  padding: 10px 20px; /* 增大按钮内边距 */
  border-radius: 20px;
  cursor: pointer;
  font-size: 15px; /* 增大字体 */
  font-weight: 500; /* 增加字体重量 */
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 60px; /* 设置最小宽度 */
  text-align: center;
}

/* 当年月列表显示时，调整按钮样式 */
.group-type-year .group-btn,
.group-type-month .group-btn {
  background: rgba(0, 0, 0, 0.08); /* 更深的背景 */
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.9); /* 黑色文字 */
}

.group-type-year .group-btn.active,
.group-type-month .group-btn.active {
  background: rgba(102, 126, 234, 0.9); /* 激活状态保持蓝色 */
  border-color: rgba(102, 126, 234, 1);
  color: white; /* 激活状态文字为白色 */
}

.group-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.group-btn.active {
  background: rgba(102, 126, 234, 0.9); /* 提高激活状态透明度 */
  border-color: rgba(102, 126, 234, 1);
  color: white;
  font-weight: 600; /* 增加字体重量 */
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3); /* 添加阴影效果 */
}

/* 分组网格样式 */
.group-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); /* 增加底部padding，避免被tab按钮遮挡 */
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%); /* 渐变背景色 */
  /* 移除min-height，让高度由内容决定 */
  box-sizing: border-box;
}

.group-grid-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  margin-bottom: 0;
}

.group-grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.group-thumbnail {
  position: relative;
  width: 100%;
  height: 300px; /* 增加到1.5倍高度 */
  overflow: hidden;
  border-radius: 12px 12px 0 0; /* 只圆角顶部 */
}

.group-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.group-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.8);
}

.group-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.7), transparent);
  color: white;
  padding: 16px;
  border-radius: 12px 12px 0 0; /* 与group-thumbnail的圆角匹配 */
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px; /* 时间和张数之间的间距 */
}

.group-time {
  font-size: 20px; /* 调大字体 */
  font-weight: 700; /* 增加字体重量 */
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); /* 添加文字阴影提高可读性 */
}

.group-count {
  font-size: 12px; /* 保持原字体大小 */
  color: rgba(255, 255, 255, 0.9); /* 稍微提高对比度 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* 添加文字阴影提高可读性 */
}

/* 移动端适配 */
@media (max-width: 768px) {
  /* 调整底部Tab高度为65px（移动端） */
  .media-preview-container {
    bottom: calc(56px + 65px + env(safe-area-inset-bottom, 0)); /* 56px是新的缩略图区域高度 */
  }
  
  /* 移动端图片预览位置调整 */
  .media-preview-content {
    margin-top: -10px; /* 由于缩略图变小，相应减少调整量 */
  }
  
  .media-thumbnails {
    bottom: calc(65px + env(safe-area-inset-bottom, 0));
    height: 56px; /* iOS风格：缩略图区域高度减少 */
  }
  
  /* 移动端缩略图大小调整 */
  .thumb-item {
    width: 32px; /* iOS风格：缩略图大小减少一半 */
    height: 32px; /* iOS风格：缩略图大小减少一半 */
    border-radius: 2px; /* 相应减少圆角 */
  }
  
  .download-progress-container {
    bottom: 120px;
    width: 90%;
    padding: 10px 14px;
  }
  
  .download-progress-details {
    bottom: 80px;
    width: 90%;
    padding: 10px 14px;
  }
  
  .download-progress-info {
    font-size: 11px;
  }
  
  /* 移动端悬浮工具栏适配 */
  .floating-group-toolbar {
    bottom: 90px; /* 相应提高移动端位置 */
    padding: 8px 12px; /* 增加内边距 */
  }
  
  .group-btn {
    padding: 8px 16px; /* 增大按钮内边距 */
    font-size: 14px; /* 增大字体 */
    min-width: 55px; /* 调整最小宽度 */
  }
  
  /* 移动端分组网格适配 */
  .group-grid {
    padding: 12px;
    gap: 12px;
  }
  
  .group-grid-item {
    border-radius: 10px;
  }
  
  .group-thumbnail {
    height: 240px;
    border-radius: 10px 10px 0 0;
  }
  
  .group-overlay {
    padding: 12px;
    top: 0; /* 确保在移动端也在顶部 */
    background: linear-gradient(rgba(0, 0, 0, 0.7), transparent); /* 保持一致的渐变 */
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px; /* 移动端间距稍小 */
  }
  
  .group-time {
    font-size: 18px; /* 移动端也调大字体，但比桌面端稍小 */
    font-weight: 700;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }
  
  .group-count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
}

/* 小屏幕设备适配 */
@media (max-width: 480px) {
  .floating-group-toolbar {
    bottom: 80px; /* 相应提高小屏幕设备位置 */
    padding: 6px 10px; /* 增加内边距 */
  }
  
  .group-btn {
    padding: 7px 14px; /* 增大按钮内边距 */
    font-size: 13px; /* 增大字体 */
    min-width: 50px; /* 调整最小宽度 */
  }
  
  .group-grid {
    padding: 8px;
    gap: 10px;
  }
  
  .group-grid-item {
    border-radius: 8px;
  }
  
  .group-thumbnail {
    height: 210px;
    border-radius: 8px 8px 0 0;
  }
  
  .group-overlay {
    padding: 10px;
    top: 0; /* 确保在小屏幕设备也在顶部 */
    background: linear-gradient(rgba(0, 0, 0, 0.7), transparent); /* 保持一致的渐变 */
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px; /* 小屏幕设备间距更小 */
  }
  
  .group-time {
    font-size: 16px; /* 小屏幕设备也调大字体 */
    font-weight: 700;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }
  
  .group-count {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
}

/* 同步对话框样式 */
.sync-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.sync-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: dialog-appear 0.3s ease-out;
}

@keyframes dialog-appear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.sync-dialog-header {
  padding: 24px 24px 16px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sync-dialog-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.sync-dialog-content {
  padding: 24px;
}

.sync-progress {
  margin-bottom: 20px;
}

.sync-progress-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  text-align: center;
}

.sync-progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.sync-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.sync-info {
  font-size: 15px;
  color: #333;
  text-align: center;
  line-height: 1.5;
  padding: 12px 0;
}

.sync-dialog-actions {
  display: flex;
  padding: 16px 24px 24px;
  gap: 12px;
}

.sync-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.sync-btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.sync-btn-cancel:hover {
  background: #e0e0e0;
}

.sync-btn-wait {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.sync-btn-wait:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.sync-btn-wait:active {
  transform: translateY(0);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sync-dialog {
    width: 85%;
    max-width: 320px;
  }
  
  .sync-dialog-header {
    padding: 20px 20px 12px;
  }
  
  .sync-dialog-header h3 {
    font-size: 18px;
  }
  
  .sync-dialog-content {
    padding: 20px;
  }
  
  .sync-info {
    font-size: 14px;
  }
  
  .sync-dialog-actions {
    padding: 12px 20px 20px;
  }
  
  .sync-btn {
    padding: 12px 16px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .sync-dialog {
    width: 90%;
    max-width: 280px;
  }
  
  .sync-dialog-header {
    padding: 16px 16px 10px;
  }
  
  .sync-dialog-header h3 {
    font-size: 16px;
  }
  
  .sync-dialog-content {
    padding: 16px;
  }
  
  .sync-info {
    font-size: 13px;
  }
  
  .sync-dialog-actions {
    padding: 10px 16px 16px;
    flex-direction: column;
  }
  
  .sync-btn {
    padding: 10px 14px;
    font-size: 14px;
  }
}
</style>
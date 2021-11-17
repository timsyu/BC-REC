import numpy as np
import matplotlib.pyplot as plt
import scipy.stats

class Distribution:
  def __init__(self):
    pass

  def draw_normal(self, seed=None, mu=0, sigma=1, size=100, toInt=False, draw=False, filename=None):
    if seed:
      np.random.seed(seed)  
    dnormal = np.random.normal(mu, sigma, size)
    if toInt:
      dnormal = np.around(dnormal).astype('int')
    _, bins_edge, _ = plt.hist(dnormal, bins=50, density=True, alpha=0.5)

    # 機率密度函數曲線
    y = scipy.stats.norm.pdf(bins_edge, mu, sigma)

    if draw:
      plt.plot(bins_edge, y, label='$\mu$=%.1f, $\sigma^2$=%.1f'%(mu, sigma))

      plt.xlabel('Expectation')
      plt.ylabel('Probability')
      plt.title('histogram of normal distribution:')
      if filename:
        plt.savefig(filename)
    return dnormal

  # 展現常態分配的機率密度函數圖
  def draw_random_normal(self, mu=0, sigma=1, size=10000):

      """
      展示三組 normal distribution 圖。
      常用參數介紹：
      np.random.normal：
      https://docs.scipy.org/doc//numpy-1.10.4/reference/generated/numpy.random.normal.html
          loc 期望值
          scale 標準差
          size 基於normal distribution生成的數量
      plt.hist：
      https://matplotlib.org/3.3.3/api/_as_gen/matplotlib.pyplot.hist.html
          Parameters:
              bins: 直方圖的柱數，可選項，默認為10；
              density: 是否將得到的直方圖各 bin 的數量規一化。默認為 False；
              color：顏色序列，默認為None；
              facecolor: 直方圖顏色；
              edgecolor: 直方圖邊框顏色；
              alpha: 透明度；
              histtype: 直方圖類型，『bar』, 『barstacked』, 『step』, 『stepfilled』
          Returns:
              n: 每個直方柱對應的數值，若 density=True，則為規一化後的數值
              bins: 每個分組的邊界數值
              patches
      scipy.stats.norm.pdf 機率密度函數
      https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.norm.html
          Parameters:
              x: 隨機變量數值
              loc: 期望值
              scale: 標準差
          Returns:
              y: 機率密度函數數值
      :return: None
      """
      np.random.seed(0)
      dnormal = np.random.normal(mu, sigma, size)
      _, bins_edge, _ = plt.hist(dnormal, bins=50, density=True, alpha=0.5)

      # 機率密度函數曲線
      y = scipy.stats.norm.pdf(bins_edge, mu, sigma)
      plt.plot(bins_edge, y, label='$\mu$=%.1f, $\sigma^2$=%.1f'%(mu, sigma))

      plt.xlabel('Expectation')
      plt.ylabel('Probability')
      plt.title('histogram of normal distribution:')

      return dnormal


  def show_random_normal_dist_plot(self):
      self.draw_random_normal(mu=0, sigma=1, size=100)
      self.draw_random_normal(mu=-2, sigma=0.5, size=100)
      self.draw_random_normal(mu=2, sigma=1.5, size=100)
      plt.legend(loc=0, ncol=1)
      plt.show()

  def show_draw_normal(self, dnormal):
    return self.draw_normal(dnormal)

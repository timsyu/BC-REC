import numpy as np
import matplotlib.pyplot as plt
import scipy.stats

class Distribution:
  def __init__(self):
    pass

  def draw_normal(self, seed=None, mu=0, sigma=1, size=100, toInt=False, draw=False):
    if seed:
      np.random.seed(seed)  
    dnormal = np.random.normal(mu, sigma, size)
    if toInt:
      dnormal = np.around(dnormal).astype('int')
    _, bins_edge, _ = plt.hist(dnormal, bins=50, density=True, alpha=0.5)

    y = scipy.stats.norm.pdf(bins_edge, mu, sigma)

    if draw:
      # plt.plot(bins_edge, y, label='$\mu$=%.1f, $\sigma^2$=%.1f'%(mu, sigma))

      plt.xlabel('Expectation')
      plt.ylabel('Probability')
      plt.title('histogram of normal distribution:')
      plt.savefig('distri.png')
    return dnormal

  def draw_random_normal(self, mu=0, sigma=1, size=10000):
      np.random.seed(0)
      dnormal = np.random.normal(mu, sigma, size)
      _, bins_edge, _ = plt.hist(dnormal, bins=50, density=True, alpha=0.5)

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

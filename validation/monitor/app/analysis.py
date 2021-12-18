import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
import statistics
import collections
import math

class Analysis:
    def __init__(self):
        pass

    def parse(seld, data, toInt):
        array = []
        for line in data:
            l = line.strip()
            if l:
                try:
                    l = float(l)
                    if toInt:
                        l = int(l)
                    array.append(l)
                except ValueError:
                    pass
        return array

    def draw(self, data=None, targetfile=None, toInt=False, draw=False, filename=None):
        array = []
        if targetfile:
            f = open(targetfile, encoding='utf8', mode='r')
            array = self.parse(f, toInt)
        elif data:
            array = self.parse(data, toInt)

        array = sorted(array)
        b = collections.Counter(array)
        dic = {number: value for number, value in b.items()} 
        x = [i for i in dic.keys()]
        y = []
        for i in dic.keys():
            y.append(dic.get(i))

        if draw:
            xp = x[len(x) - 1]
            yp = max(y)
            ax = plt.figure().gca()
            ax.yaxis.set_major_locator(MaxNLocator(integer=True))
            plt.xlabel('time(sec)')
            plt.ylabel('appear number')
            plt.title('line chart of time distribution:')
            t = "average={average:.3f}(s)".format(average=statistics.mean(array))
            plt.text(xp, yp, t, ha='right', va='top', wrap=True)
            plt.plot(x, y)
            # plt.show()
            if filename:
                plt.savefig(filename)

            return plt
        
        return (array, x, y)

    def combine(self, targetfiles, toInt=False, draw=False, filename=None):
        ax = plt.figure().gca()
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        plt.xlabel('time(sec)')
        plt.ylabel('appear number')
        plt.title('line chart of time distribution:')
        averages = []
        for targetfile in targetfiles:
            array, x, y = a.draw(targetfile=targetfile, toInt=toInt)
            averages.append(statistics.mean(array))
            plt.plot(x, y)
        hint = ["{name:d}, average={average:.3f}(s)".format(name=i + 1, average=averages[i]) for i in range(len(averages))]
        plt.legend(hint)
        if draw:
            # plt.show()
            if filename:
                plt.savefig(filename)
            return plt

# if __name__ == '__main__':
#     a = Analysis()
#     a.draw(targetfile='a.txt', toInt=True, draw=True, filename='a.png')
#     a.combine(targetfiles=['a.txt', 'b.txt', 'c.txt'], toInt=True, draw=True, filename='total.png')
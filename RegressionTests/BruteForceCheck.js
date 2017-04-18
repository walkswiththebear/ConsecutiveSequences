/*
 Copyright (c) 2017 Thomas Becker

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

exports.functions = new function()
{
    var numberOfPermutationsModule = require("../ConsecutiveSequences.js");

    // Generic Algorithms
    // ==================

    /**
     * Brute-force applies a function to every permutation of numElements elements.
     * The
     */
    this.forEachPermutation = function(
        numElements,
        fun
    )
    {
        var i;
        var permutation = new Array(numElements);

        // Prepare the array for in-place generation of all permutations
        //
        for(i = 0; i < numElements; ++i)
        {
            permutation[i] = i;
        }

        // Top level entry into the recursive function for in-place generation of all permutations.
        forEachPermutationRecursive(0);

        /**
         * Recursive helper that generates all permutations in-place and applies the function.
         */
        function forEachPermutationRecursive(
            startIndex
        )
        {
            var temp = permutation[startIndex];
            var i;
            var len = permutation.length;

            //
            //
            if(startIndex == len - 1)
            {
                fun(permutation);
                return;
            }

            // Standard way of generating permutations in-place: loop and recursive call.
            //
            for(i = startIndex; i < len; ++i)
            {
                permutation[startIndex] = permutation[i];
                permutation[i] = temp;

                forEachPermutationRecursive(startIndex + 1);

                permutation[i] = permutation[startIndex];
                permutation[startIndex] = temp;
            }
        }
    };

    /**
     * Returns the number of permutations that satisfy a specified condition.
     */
    this.countPermutations = function(
        numElements,
        cond
    )
    {
        var numPermutations = 0;
        var countingFunction = function(permutation)
        {
            if(cond(permutation))
            {
                ++numPermutations;
            }
        }

        this.forEachPermutation(numElements, countingFunction);
        return numPermutations;
    };

    // Instantiations of the Generic Algorithms
    // ========================================

    /**
     * Returns the number of permutations that have no consecutive sequences.
     */
    this.numberOfPermutationsWithNoConsecutiveSequences = function(
        numElements
    )
    {
        return this.countPermutations(numElements, function(permutation)
        {
            return !hasConsecutiveSequence(permutation)
        });
    };

    /**
     * Returns an array of length numElements whose i-th entry is the number of permutations with i
     * consecutive pairs.
     */
    this.numberOfPermutationsByConsecutivePairCount = function(
        numElements
    )
    {
        var result = new Array(numElements);
        for(var i = 0; i < numElements; ++i)
        {
            result[i] = 0;
        }

        this.forEachPermutation(numElements, function(permutation)
        {
            ++result[countConsecutivePairsInPermutation(permutation)];
        });

        return result;
    };

    /**
     * Returns the number of permutations that have at least one maximal consecutive sequence
     * in the indicated length range, but none outside of it.
     */
    this.numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange = function(
        numElements,
        minLength,
        maxLength
    )
    {
        return this.countPermutations(numElements, function(permutation)
        {
            return hasMaximalConsecutiveSequenceInLengthRange(permutation, minLength, maxLength) &&
                   !hasMaximalConsecutiveSequenceOutsideLengthRange(permutation, minLength, maxLength);
        });
    };

    /**
     * Returns the number of permutations that have at least one consecutive sequence, but none of length
     * greater than maxLength.
     */
    this.numberOfPermutationsWithConsecutiveSequencesOnlyUpToSomeLength = function(
        numElements,
        maxLength
    )
    {
        // As a kind of a cross-check, first count the number of permutations that have no consecutive
        // sequence exceeding maxLength, then subtract from that the number of permutations with no
        // consecutive sequences at all.
        //
        return this.countPermutations(numElements, function(permutation)
            {
                return !hasConsecutiveSequenceOfLengthGreaterThan(permutation, maxLength);
            }) - numberOfPermutationsModule.numberOfPermutationsWithNoConsecutiveSequences(numElements);
    };

    /**
     * Returns the number of permutations that have at least one consecutive sequence, but none of length
     * less than minLength.
     */
    this.numberOfPermutationsWithConsecutiveSequencesOnlyFromSomeLengthUp = function(
        numElements,
        minLength
    )
    {
        // As a kind of a cross-check, first count the number of permutations that have no consecutive
        // sequence of length less than minLength, then subtract from that the number of permutations with no
        // consecutive sequences at all.
        //
        return this.countPermutations(numElements, function(permutation)
            {
                return !hasMaximalConsecutiveSequenceOfLengthLessThan(permutation, minLength);
            }) - numberOfPermutationsModule.numberOfPermutationsWithNoConsecutiveSequences(numElements);
    };

    /**
     * Returns the number of permutations that do not have a consecutive sequence longer than the indicated
     * limit.
     */
    this.numPermutationsWithNoConsecutiveSequencesLongerThan = function(
        numElements,
        maxLength
    )
    {
        return this.countPermutations(numElements, function(permutation)
        {
            return !hasConsecutiveSequenceOfLengthGreaterThan(permutation, maxLength);
        });
    };

    /**
     * Returns the number of permutations that have a consecutive sequence longer than the indicated
     * limit.
     */
    this.numPermutationsWithAtLeastOneConsecutiveSequenceLongerThan = function(
        numElements,
        maxLength
    )
    {
        return this.countPermutations(numElements, function(permutation)
        {
            return hasConsecutiveSequenceOfLengthGreaterThan(permutation, maxLength);
        });
    };

    /**
     * Returns the number of permutations that have a specified number of consecutive sequences
     * of a specified length.
     */
    this.numPermutationsWithGivenNumberOfConsecutiveSequencesOfLength = function(
        numElements,
        length,
        count
    )
    {
        return this.countPermutations(numElements, function(permutation)
        {
            return hasGivenNumberOfConsecutiveSequencesOfLength(permutation, length, count);
        });
    };

    // Functions Used in Instantiations
    // ================================

    /**
     * Returns the number of consecutive pairs in the permutation of
     * (0, 1, ..., n-1) that is stored in the array permutation.
     */
    function countConsecutivePairsInPermutation(permutation)
    {
        var numConsecutivePairs = 0;
        var len = permutation.length;
        var i;

        for(i = 0; i < len - 1; ++i)
        {
            if(permutation[i + 1] == permutation[i] + 1)
            {
                ++numConsecutivePairs;
            }
        }

        return numConsecutivePairs;
    }

    /**
     * Returns true if the specified permutation has a maximal consecutive sequence in the indicated
     * length range.
     */
    function hasMaximalConsecutiveSequenceInLengthRange(
        permutation,
        minLength,
        maxLength
    )
    {
        var len = permutation.length;
        var currentConsecutiveSequenceLength = 1;
        var i;

        for(i = 0; i < len - 1; ++i)
        {
            if(permutation[i + 1] == permutation[i] + 1)
            {
                ++currentConsecutiveSequenceLength;
            }
            else if(currentConsecutiveSequenceLength > 1)
            {
                if(currentConsecutiveSequenceLength >= minLength && currentConsecutiveSequenceLength <= maxLength)
                {
                    return true;
                }
                currentConsecutiveSequenceLength = 1;
            }
        }

        if(currentConsecutiveSequenceLength >= minLength && currentConsecutiveSequenceLength <= maxLength)
        {
            return true;
        }

        return false;
    }

    /**
     * Returns true if the specified permutation has a maximal consecutive sequence outside the indicated
     * length range.
     */
    function hasMaximalConsecutiveSequenceOutsideLengthRange(
        permutation,
        minLength,
        maxLength
    )
    {
        var len = permutation.length;
        var currentConsecutiveSequenceLength = 1;
        var i;

        for(i = 0; i < len - 1; ++i)
        {
            if(permutation[i + 1] == permutation[i] + 1)
            {
                ++currentConsecutiveSequenceLength;
            }
            else if(currentConsecutiveSequenceLength > 1)
            {
                if(currentConsecutiveSequenceLength < minLength || currentConsecutiveSequenceLength > maxLength)
                {
                    return true;
                }
                currentConsecutiveSequenceLength = 1;
            }
        }

        if(currentConsecutiveSequenceLength > 1 &&
           (currentConsecutiveSequenceLength < minLength || currentConsecutiveSequenceLength > maxLength))
        {
            return true;
        }

        return false;
    }

    /**
     * Returns true if the specified permutation has a consecutive sequence of length greater than maxLength.
     */
    function hasConsecutiveSequenceOfLengthGreaterThan(
        permutation,
        maxLength
    )
    {
        var len = permutation.length;
        var currentConsecutiveSequenceLength = 1;
        var i;

        for(i = 0; i < len - 1; ++i)
        {
            if(permutation[i + 1] == permutation[i] + 1)
            {
                ++currentConsecutiveSequenceLength;
            }
            else
            {
                currentConsecutiveSequenceLength = 1;
            }

            if(currentConsecutiveSequenceLength > maxLength)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns true if the specified permutation has a maximal consecutive sequence of length less than
     * minLength.
     */
    function hasMaximalConsecutiveSequenceOfLengthLessThan(
        permutation,
        minLength
    )
    {
        var len = permutation.length;
        var currentConsecutiveSequenceLength = 1;
        var i;

        for(i = 0; i < len - 1; ++i)
        {
            if(permutation[i + 1] == permutation[i] + 1)
            {
                ++currentConsecutiveSequenceLength;
            }
            else if(currentConsecutiveSequenceLength > 1)
            {
                if(currentConsecutiveSequenceLength < minLength)
                {
                    return true;
                }
                currentConsecutiveSequenceLength = 1;
            }
        }

        if(currentConsecutiveSequenceLength > 1 && currentConsecutiveSequenceLength < minLength)
        {
            return true;
        }

        return false;
    }

    /**
     * Returns true if the specified permutation has a consecutive sequence.
     */
    function hasConsecutiveSequence(
        permutation
    )
    {
        var len = permutation.length;
        var i;

        for(i = 0; i < len - 1; ++i)
        {
            if(permutation[i + 1] == permutation[i] + 1)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns true if the specified permutation has a maximal consecutive sequence of length less than
     * minLength.
     */
    function hasGivenNumberOfConsecutiveSequencesOfLength(
        permutation,
        length,
        count
    )
    {
        var len = permutation.length;
        var currentConsecutiveSequenceLength = 1;
        var currentCount = 0;
        var i;

        for(i = 0; i < len - 1; ++i)
        {
            if(permutation[i + 1] == permutation[i] + 1)
            {
                ++currentConsecutiveSequenceLength;
                if(currentConsecutiveSequenceLength >= length)
                {
                    ++currentCount;
                    if(currentCount > count)
                    {
                        return false;
                    }
                }
            }
            else if(currentConsecutiveSequenceLength > 1)
            {
                currentConsecutiveSequenceLength = 1;
            }
        }

        if(currentCount === count)
        {
            return true;
        }

        return false;
    }
}();

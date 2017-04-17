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

/**
 * Consider a permutation p of the n natural numbers {0, 1, ..., n-1}, and let k >= 2. A
 * *consecutive sequence* of length k in the permutation is an occurrence of k consecutive
 * integers in the permutation, that is, an occurrence of a contiguous subsequence of the
 * form (i, i+1, ..., i+k-1). A *maximal consecutive sequence* is a consecutive sequence
 * that is not part of a longer consecutive sequence.
 *
 * This module contains various algorithms for counting permutations with and without certain
 * consecutive sequences.
 */
algorithms = new function()
{
    var bigInt = require("./3rdParty/BigInteger.js");

    // Module Interface
    // ================

    /**
     * Number Of Permutations
     * ======================
     *
     * Returns the number of permutations of numElements, that is, numElements!. This function is provided
     * here because it is sometimes more efficient to calculate the size of the complement of a set of
     * permutations that one is interested in than to calculate the size of that set directly. The function
     *
     *
     *
     * below is an example.
     *
     * Precondition
     * ============
     * numElements is an integer (i.e., a js integer, a string that parses as a bigInt, or a bigInt), and
     * numElements >= 1
     */
    this.numberOfPermutations = function(numElementsIn)
    {
        return this.factorialExt(bigInt(2), numElements)
    }

    /**
     * Algorithm for the Number Of Permutations with no Consecutive Sequences
     * ======================================================================
     *
     * Returns the number of permutations of numElements elements that have no consecutive sequences. The result type
     * is bigInt. This is the recursive algorithm given by Jed Yang on Quora:
     *
     * https://www.quora.com/What-is-the-probability-that-a-shuffled-music-album-will-have-at-least-two-songs-in-their-original-relative-consecutive-order
     *
     * Since the recursive algorithm for calculating the result for n elements refers to the value for n-1
     * and n-2 elements, a straightforward implementation of the recursive formula is exponential in n. We
     * implement a bottom-up version that uses constant space and linear time.
     *
     * Precondition
     * ============
     * numElements is an integer (i.e., a js integer, a string that parses as a bigInt, or a bigInt), and
     * numElements >= 1
     */
    this.numberOfPermutationsWithNoConsecutiveSequences = function(numElementsIn)
    {
        var numElements = bigInt(numElementsIn);
        var bigOne = bigInt.one;
        var bigTwo = bigInt[2];
        var bigThree = bigInt[3];

        var twoPreviousValues = [bigOne, bigOne];
        var newValue;
        var i;

        if(numElements.eq(bigOne) || numElements.eq(bigTwo))
        {
            return bigOne;
        }

        for(i = bigThree; i.leq(numElements); i = i.plus(bigOne))
        {
            newValue = (i.minus(bigOne).times(twoPreviousValues[1])).plus(i.minus(bigTwo).times(twoPreviousValues[0]));
            twoPreviousValues[0] = twoPreviousValues[1];
            twoPreviousValues[1] = newValue;
        }

        return newValue;
    };

    /**
     * Algorithm for the Number of Permutations that Meet an MCS-Specification by Lengths and Counts
     * =============================================================================================
     *
     * An MCS-specification by lengths and counts is a map that specifies, for each possible length, the
     * number of maximal consecutive sequences of that length. This function returns the number of
     * permutations of numElements elements that meet a given MCS-specification by lengths and counts.
     *
     * The argument mcsSpecificationByLengthsAndCounts must be a map whose keys are a subset of the set
     * {2, ..., numElements}. For each key k, the value of k is interpreted as the desired number of
     * maximal consecutive sequences of length k. If the combined length of all requested maximal
     * consecutive sequences (i.e., the sum of k * value(k) over all keys k) is less than numElements,
     * the returned number of permutations will be greater than zero. Otherwise, it will be zero.
     *
     * If a sequence length does not occur as a key in the map mcsSpecificationByLengthsAndCounts, the number
     * of maximal consecutive sequences of that length is assumed to be zero. However, a zero number of requested
     * maximal consecutive sequences may also be requested explicitly with a zero value.
     *
     * Preconditions:
     * ==============
     *
     * 1. numElements is an integer (i.e., a js integer, a string that parses as a bigInt, or a bigInt), and
     *    numElements >= 1
     *
     * 2. The keys of the map numMaximalConsecutiveSequencesOfEachLength are strings that parse as bigInts, and as
     *    integers, they are a subset of the set {2, ..., numElements}.
     *
     * 3. The values of the map numMaximalConsecutiveSequencesOfEachLength are non-negative integers. Here, "integer"
     *    means a js integer, a string that parses as a bigInt, or a bigInt.
     */
    this.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts = function(
        numElementsIn,
        mcsSpecificationByLengthsAndCounts
    )
    {
        // Big ints
        var numElements = bigInt(numElementsIn);
        var bigZero = bigInt.zero;
        var bigOne = bigInt.one;

        // Local variables
        //
        var i;
        var numMaximalConsecutiveSequencesOfRequestedLength;
        var requestedLength;
        var requestedLengthBig;
        var numRemainingBaseElements;

        // Variables for processing requested sequence lengths
        //
        var arrayOfMaximalRequestedConsecutiveSequenceLengths = Object.keys(mcsSpecificationByLengthsAndCounts);
        var numMaximalRequestedConsecutiveSequenceLengths = arrayOfMaximalRequestedConsecutiveSequenceLengths.length;
        var combinedLengthOfRequestedMaximalConsecutiveSequences = bigZero;
        var numRequestedMaximalConsecutiveSequencesTotal = bigZero;

        // Number of permutations with no consecutive sequences that will be blown up to obtain the
        // desired permutations
        var numBasePermutations;

        // Number of elements in the base permutations
        var numBaseElements;

        // Number of ways to blow up each base permutation to obtain a requested permutation
        var numMaximalConsecutiveSequenceConfigurations = bigOne;

        // End result
        var result;

        // Determine the combined length of all requested maximal consecutive sequences and the
        // total number of requested maximal consecutive sequences.
        //
        for(i = 0; i < numMaximalRequestedConsecutiveSequenceLengths; ++i) // don't use forEach because we may break
        {
            requestedLength = arrayOfMaximalRequestedConsecutiveSequenceLengths[i];
            requestedLengthBig = bigInt(requestedLength);
            numMaximalConsecutiveSequencesOfRequestedLength =
                bigInt(mcsSpecificationByLengthsAndCounts[requestedLength]);

            // Update the combined length of all requested maximal consecutive sequences.
            //
            combinedLengthOfRequestedMaximalConsecutiveSequences =
                combinedLengthOfRequestedMaximalConsecutiveSequences.plus(
                    requestedLengthBig.times(numMaximalConsecutiveSequencesOfRequestedLength));
            if(combinedLengthOfRequestedMaximalConsecutiveSequences.gt(numElements))
            {
                return bigZero;
            }

            // Update the total number of requested maximal consecutive sequences (of any length).
            numRequestedMaximalConsecutiveSequencesTotal =
                numRequestedMaximalConsecutiveSequencesTotal.plus(numMaximalConsecutiveSequencesOfRequestedLength);
        }

        // Determine the number of base permutations, i.e., the permutations with no consecutive sequences
        // that will be blown up to permutations of numElements with the requested numbers of maximal consecutive
        // sequences.
        //
        numBaseElements = numElements.minus(
            combinedLengthOfRequestedMaximalConsecutiveSequences.minus(numRequestedMaximalConsecutiveSequencesTotal));
        numBasePermutations = this.numberOfPermutationsWithNoConsecutiveSequences(numBaseElements);

        // Determine the number of ways that the requested maximal consecutive sequences can be arranged (by length)
        // within numElements elements.
        //
        numMaximalConsecutiveSequenceConfigurations =
            factorialExt(numBaseElements.minus(numRequestedMaximalConsecutiveSequencesTotal.minus(bigOne)),
                numBaseElements);
        arrayOfMaximalRequestedConsecutiveSequenceLengths.forEach(function(requestedLength)
        {
            numMaximalConsecutiveSequenceConfigurations = numMaximalConsecutiveSequenceConfigurations.divide(
                factorialExt(bigOne, bigInt(mcsSpecificationByLengthsAndCounts[requestedLength])));
        });

        // Each of the requested permutations can be obtained in exactly one way by choosing a base
        // permutation, then choosing one way of arranging the requested maximal consecutive sequences by
        // length.
        //
        result = numBasePermutations.times(numMaximalConsecutiveSequenceConfigurations);
        return result;
    };

    /**
     * Algorithm for the Number of Permutations that Meet Certain MCS-Specification by Lengths and Counts
     * ==================================================================================================
     *
     * An MCS-specification by lengths and counts is a map that specifies, for each possible length, the
     * number of maximal consecutive sequences of that length. This function returns the number of
     * permutations of numElements elements that meet certain MCS-specifications by lengths and counts.
     * A client-supplied function decides which MCS-specifications are to be accepted for the count. See
     * the documentation at function getNewSelectionCondition for details on how the client-supplied function
     * needs to be written.
     *
     * Preconditions:
     * ==============
     *
     * 1. numElements is a javascript integer, and numElements >= 1
     *
     * 2. selectionCondition is an instance of SelectionCondition. (See documentation at getNewSelectionCondition.)
     */
    this.numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts = function(
        numElements,
        selectionCondition
    )
    {
        var numElementsBig = bigInt(numElements);
        var minLength = selectionCondition.noMaximalConsecutiveSequencesOfLengthLessThan ? //
                        selectionCondition.noMaximalConsecutiveSequencesOfLengthLessThan : 2;

        var maxLength = selectionCondition.noMaximalConsecutiveSequencesOfLengthGreaterThan ? //
                        selectionCondition.noMaximalConsecutiveSequencesOfLengthGreaterThan : numElements;

        var result = bigInt.zero;

        var mcsSpecificationByLengthsAndCounts = new Array();
        var i;

        for(i = 0; i < numElements + 1; ++i)
        {
            mcsSpecificationByLengthsAndCounts.push(bigInt.zero);
        }

        numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCountsRecursive.call(this, numElementsBig,
            maxLength, selectionCondition);

        /**
         * The recursive part. Does an in-place construction of all possible combinations of lengths of maximal
         * consecutive sequences, and then, at the bottom, updates the total number of permutations with the number
         * of permutations with that combination of maximal consecutive sequence lengths, provided that the functional
         * returns true on that combination.
         *
         * Preconditions:
         * ==============
         *
         * 1. numElementsRecursive is a bigInt >= 1
         *
         * 2. lengthRecursive is a javascript integer
         *
         * 3. lengthRecursive >= 1 // == is bottom of recursion
         */
        function numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCountsRecursive(
            numElementsRecursive,
            lengthRecursive,
            selectionCondition
        )
        {
            var bigZero = bigInt.zero;
            var bigOne = bigInt.one;

            var maxNumMaximalConsecutiveSequencesOfRecursiveLength;
            var numMaximalConsecutiveSequencesOfRecursiveLength;

            var mcsSpecificationByLengthsAndCountsAsMap = {};

            // The recursion bottoms out in two cases:
            //
            // 1. We've looked at all consecutive sequence lengths down to the minimum according to the
            //    selection condition, or
            // 2. There is not enough room left to put another consecutive sequence longer than the minimum length.
            //
            if(lengthRecursive < minLength || numElementsRecursive.lt(minLength))
            {
                // Add the number of permutations with this combination of lengths, unless the user-provided
                // selection function forbids it.
                //
                if(selectionCondition.acceptMcsSpecification(mcsSpecificationByLengthsAndCounts))
                {
                    mcsSpecificationByLengthsAndCounts.forEach(function(
                        elem,
                        index
                    )
                    {
                        if(!elem.eq(bigZero))
                        {
                            mcsSpecificationByLengthsAndCountsAsMap[index.toString()] = elem;
                        }
                    });

                    result = result.plus(
                        this.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts(numElementsBig,
                            mcsSpecificationByLengthsAndCountsAsMap));
                }
                return;
            }

            // Iterate over all numbers of maximal consecutive sequences of length lengthRecursive that fit
            // in the number of elements, and then recursively look at all ways to place shorter consecutive
            // sequences in the remaining number of elements. This is an in-place construction of all possible
            // MCS-specifications by lengths and counts for numElements many elements, achieved by depth-first
            // traversal of the tree whose nodes are pairs of length and count, with each level of the tree
            // holding the pairs for a particular length.
            //
            maxNumMaximalConsecutiveSequencesOfRecursiveLength = numElementsRecursive.over(lengthRecursive);
            for(numMaximalConsecutiveSequencesOfRecursiveLength = bigZero;
                numMaximalConsecutiveSequencesOfRecursiveLength.leq(maxNumMaximalConsecutiveSequencesOfRecursiveLength);
                numMaximalConsecutiveSequencesOfRecursiveLength =
                    numMaximalConsecutiveSequencesOfRecursiveLength.plus(bigOne))
            {
                // Do the recursive descent
                //
                mcsSpecificationByLengthsAndCounts[lengthRecursive] = numMaximalConsecutiveSequencesOfRecursiveLength;
                numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCountsRecursive.call(this,
                    numElementsRecursive.minus(numMaximalConsecutiveSequencesOfRecursiveLength.times(lengthRecursive)),
                    lengthRecursive - 1, selectionCondition);
                mcsSpecificationByLengthsAndCounts[lengthRecursive] = bigZero;
            }
        }

        return result;
    };

    /**
     * Factory function for obtaining a new selection condition, to be used with the function
     * numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts. Read the documentation
     * of that function before reading this documentation.
     *
     * The function numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts presents each possible
     * MCS-specification by lengths and counts to the selection condition, for a decision whether the permutations
     * that meet that MCS-specification should be included in the count.
     *
     * More precisely, if selectionCondition is the SelectionCondition object obtained from getNewSelectionCondition,
     * the function numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts calls
     *
     * selectionCondition.acceptMcsSpecification(spec);
     *
     * for every MCS-specification by lengths and counts. Here, spec is an array whose entry at index i is
     * the number of maximal consecutive sequences of length i. (The elements of the array are bigInts, and
     * the entries at i=0 and i=1 are always 0.) If the client-supplied function acceptMcsSpecification returns
     * true on such a specification, the permutations that meet that specification will be accepted for the
     * count; otherwise, they won't be.
     *
     * There is one optimization that may allow the client to cut down on the number of MCS-specifications by
     * lengths and counts that need to be looked at. If you pass an integer minLength as the second argument to
     * getNewSelectionCondition, then only those MCS-specifications by lengths and counts will be presented to
     * your selection condition that specify zero maximal consecutive sequences for every length less than minLength.
     * If you pass an integer maxLength as the third argument to getNewSelectionCondition, then only those
     * MCS-specifications by lengths and counts will be presented to your selection condition that specify zero
     * maximal consecutive sequences for every length greater than maxLength. If you want to pass just the third
     * argument but not the second, pass a falsy value for the second argument.
     *
     * See the functions
     *
     * numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange
     *
     * and
     *
     * numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo
     *
     * below for examples of how to write the acceptMcsSpecification function and use the minLength/maxLength
     * optimization for your selection condition.

     * below for an example of how to use
     * the minLength/maxLength optimization.
     *
     * Preconditions:
     * ==============
     *
     * noMaximalConsecutiveSequencesOfLengthLessThan is a js integer, and
     * noMaximalConsecutiveSequencesOfLengthLessThan >= 2.
     *
     * noMaximalConsecutiveSequencesOfLengthGreaterThan is a js integer, and
     * noMaximalConsecutiveSequencesOfLengthGreaterThan >= 1.
     *
     */
    this.getNewSelectionCondition = function(
        acceptMcsSpecification,
        noMaximalConsecutiveSequencesOfLengthLessThan, // optional
        noMaximalConsecutiveSequencesOfLengthGreaterThan // optional
    )
    {
        return new SelectionCondition(acceptMcsSpecification, noMaximalConsecutiveSequencesOfLengthLessThan, //
            noMaximalConsecutiveSequencesOfLengthGreaterThan);
    };

    /**
     * Algorithm for the Number of Permutations with Maximal Consecutive Sequences only in a Specified Length Range
     * ============================================================================================================
     *
     * Returns the number of permutations of numElements elements that have at least one maximal consecutive
     * sequence within a specified length range, but none of any length outside that range.
     *
     * This algorithm is provided mainly as an example of how to use the minLength/maxLength feature of
     * the selection condition.
     *
     * Recall that a consecutive sequence of length k in a permutation is an occurrence of
     * (..., i, ..., i + k - 1, ...) in the permutation, with k >= 2, and a maximal consecutive
     * sequence is a consecutive sequence that is not part of a longer consecutive sequence.
     *
     * Preconditions:
     * ==============
     *
     * 1. numElements is a javascript integer, and numElements >= 1
     *
     * 2. minLength is a javascript integer, and minLength >= 2
     *
     * 3. maxLength is a javascript integer, and maxLength >= minLength
     */
    this.numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange = function(
        numElements,
        minLength,
        maxLength
    )
    {
        var acceptMcsSpecification = function(
            mcsSpecificationByLengthsAndCounts
        )
        {
            var bigZero = bigInt.zero;
            var i;

            for(i = minLength; i <= maxLength; ++i)
            {
                if(mcsSpecificationByLengthsAndCounts[i].gt(bigZero))
                {
                    return true;
                }
            }
            return false;
        };

        return this.numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts(numElements,
            this.getNewSelectionCondition(acceptMcsSpecification, minLength, maxLength));
    };

    /**
     * Algorithm for the Number of Permutations with at Least One Maximal Consecutive Sequence Longer than
     * ===================================================================================================
     *
     * Returns the number of permutations of numElements elements that have at least one maximal consecutive
     * sequence of length greater than or equal to a specified minimum length.
     *
     * This algorithm is provided mainly as an example of how to write a selection condition for the function
     * numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts. Also, this function demonstrates
     * that it may take a little creativity to get the most out of the minLength/maxLength optimization that
     * the selection condition offers. A straightforward implementation of this function would not be able
     * to use that optimization. However, if one calculates the number of permutations that do *not* have any
     * maximal consecutive sequences of length greater than or equal to the minimum length and then subtracts
     * that from the number of all permutations, then the optimization can be applied.
     *
     * Recall that a consecutive sequence of length k in a permutation is an occurrence of
     * (..., i, ..., i + k - 1, ...) in the permutation, with k >= 2, and a maximal consecutive
     * sequence is a consecutive sequence that is not part of a longer consecutive sequence.
     *
     * Preconditions:
     * ==============
     *
     * 1. numElements is a javascript integer, and numElements >= 1
     *
     * 2. minLength is a javascript integer, and minLength >= 2
     */
    this.numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo = function(
        numElements,
        minLength
    )
    {
        var acceptMcsSpecification = function(
            mcsSpecificationByLengthsAndCounts
        )
        {
            return true;
        };

        return factorialExt(bigInt.one, numElements)
            .minus(this.numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts(numElements,
                this.getNewSelectionCondition(acceptMcsSpecification, undefined, minLength - 1)));
    };

    /**
     * Algorithm for the Number of Permutations with Consecutive Sequence(s) of a Given Length
     * =======================================================================================
     *
     * Returns the number of permutations of numElements elements that have at least one consecutive
     * sequence of a specified length.
     *
     * This algorithm is provided mainly as an example of how to use the algorithms for counting permutations
     * with certain configurations of maximal consecutive sequences for counting the number of permutations
     * with certain configurations of consecutive sequences. In this case, it is as simple as calling the
     * function
     *
     * numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo
     *
     * Recall that a consecutive sequence of length k in a permutation is an occurrence of
     * (..., i, ..., i + k - 1, ...) in the permutation, with k >= 2, and a maximal consecutive
     * sequence is a consecutive sequence that is not part of a longer consecutive sequence.
     *
     * Preconditions:
     * ==============
     *
     * 1. numElements is a javascript integer, and numElements >= 1
     *
     * 2. length is a javascript integer, and length >= 2
     */
    this.numberOfPermutationsWithAtLeastOneConsecutiveSequenceOfLength = function(
        numElements,
        length
    )
    {
        return this.numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo(
            numElements, length);
    };

    /**
     * Algorithm for the Number of Permutations with a Given Number of Consecutive Sequences of a Given Length
     * =======================================================================================================
     *
     * Returns the number of permutations of numElements elements that have a specified number of consecutive
     * sequences of a specified length.
     *
     * This algorithm is provided mainly as an example of how to use the algorithms for counting permutations
     * with certain configurations of maximal consecutive sequences for counting the number of permutations
     * with certain configurations of consecutive sequences.
     *
     * Recall that a consecutive sequence of length k in a permutation is an occurrence of
     * (..., i, ..., i + k - 1, ...) in the permutation, with k >= 2, and a maximal consecutive
     * sequence is a consecutive sequence that is not part of a longer consecutive sequence.
     *
     * Preconditions:
     * ==============
     *
     * 1. numElements is a javascript integer, and numElements >= 1
     *
     * 2. length is a javascript integer, and length >= 2
     *
     * 3. count is a javascript integer, and count >= 0
     */
    this.numberOfPermutationsWithGivenNumberOfConsecutiveSequencesOfLength = function(
        numElements,
        length,
        count
    )
    {
        var maxLength = Math.min(length + count - 1, numElements);

        var acceptMcsSpecification = function(
            mcsSpecificationByLengthsAndCounts
        )
        {
            var bigZero = bigInt.zero;
            var bigOne = bigInt.one;
            var bigCount = bigInt(count);
            var bigLengthMinusOne = bigInt(length).minus(bigOne);
            var i;
            var countForThisMcsSpecification = bigZero;

            for(i = length; i <= maxLength; ++i)
            {
                countForThisMcsSpecification = countForThisMcsSpecification.plus(
                    mcsSpecificationByLengthsAndCounts[i].times(i - bigLengthMinusOne));
                if(countForThisMcsSpecification.gt(bigCount))
                {
                    return false;
                }
            }

            if(countForThisMcsSpecification.eq(bigCount))
            {
                return true;
            }

            return false;
        };

        return this.numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts(numElements,
            this.getNewSelectionCondition(acceptMcsSpecification, undefined, maxLength));
    };

    /**
     * Algorithm for the Number of Permutations by Consecutive Pair Count
     * ==================================================================
     *
     * Returns an array of length numElements such that the entry at index i is the
     * number of permutations with i consecutive pairs. The array elements are of type bigInt.
     *
     * NOTE: This algorithm is provided here more or less as a curiosity. It employs a logic
     * that seems to work only for consecutive pairs, but not for consecutive sequences of
     * greater length.
     *
     * Recall that a consecutive pair is an occurrence of two consecutive integers, possibly as
     * part of a longer consecutive sequence. So the permutation (3, 4, 1, 2) has two consecutive
     * pairs, and so does the permutation (4, 1, 2, 3).
     *
     * Precondition
     * =============
     * numElements is a javascript integer and numElements >= 1
     *
     * NOTE: numElements cannot be a bigInt because the function returns an array of length
     * numElements.
     */
    this.numberOfPermutationsByConsecutivePairCount = function(numElements)
    {
        return numberOfPermutationsByConsecutivePairCountInternal(numElements).slice(1, numElements + 1);

        /**
         * Internal recursive algorithm. Internally uses an array with an additional zero at the beginning
         * and two additional zeroes at the end, for convenience.
         */
        function numberOfPermutationsByConsecutivePairCountInternal(numElementsIn)
        {
            var numElementsBig = bigInt(numElementsIn);
            var bigOne = bigInt.one;
            var bigZero = bigInt.zero;
            var previousCounts;
            var counts;
            var i;
            var iBig;

            if(numElementsIn == 1)
            {
                return [bigZero, bigOne, bigZero, bigZero];
            }

            previousCounts = numberOfPermutationsByConsecutivePairCountInternal(numElementsIn - 1);
            counts = new Array();
            counts.push(bigZero);
            for(i = 1, iBig = bigOne; i <= numElementsIn; ++i, iBig = iBig.plus(bigOne))
            {
                // Here, we're placing the number of permutations with i-1 consecutive pairs in the array slot
                // at index i. When a permutation of (0, 1, ...,n-1) is created from a permutation of
                // (0, 1, ...,n-2) by adding the number n-1, then a permutation with exactly i-1 consecutive
                // paris can originate from three sources:
                //
                // 1. Taking a permutation with i-2 consecutive pairs and adding the new element n-1 following n-2
                //
                // 2. Taking a permutation with i-1 consecutive pairs and adding the new element anywhere, but not
                // following n-2 and not in such a way that it splits a consecutive pair.
                //
                // 3. Taking a permutation with i consecutive pairs and using the new element to split one of them.
                //
                // The three summands below correspond to these three sources.
                //
                counts.push(previousCounts[i - 1].plus(previousCounts[i].times(numElementsBig.minus(iBig)))
                                                 .plus(previousCounts[i + 1].times(iBig)));
            }
            counts.push(bigZero, bigZero);

            return counts;
        }
    };

    // Private Helpers
    // ===============

    /**
     * Returns the product of the integers fromAndIncluding, fromAndIncluding + 1, ..., toAndIncluding.
     * Expects bigInts.
     */
    function factorialExt(
        fromAndIncluding,
        toAndIncluding
    )
    {
        var currentFactor = fromAndIncluding;
        var product = bigInt.one;

        for(; currentFactor.leq(toAndIncluding); currentFactor = currentFactor.plus(1))
        {
            product = product.times(currentFactor);
        }

        return product;
    }

    /**
     * Constructor function for selection conditions.
     *
     * See the documentation at getNewSelectionCondition for details.
     */
    function SelectionCondition(
        acceptMcsSpecification,
        noMaximalConsecutiveSequencesOfLengthLessThan, // optional
        noMaximalConsecutiveSequencesOfLengthGreaterThan // optional
    )
    {
        this.acceptMcsSpecification = acceptMcsSpecification;
        this.noMaximalConsecutiveSequencesOfLengthLessThan = noMaximalConsecutiveSequencesOfLengthLessThan;
        this.noMaximalConsecutiveSequencesOfLengthGreaterThan = noMaximalConsecutiveSequencesOfLengthGreaterThan;
    }
}();

module.exports = {
    numberOfPermutations : algorithms.numberOfPermutations,
    numberOfPermutationsWithNoConsecutiveSequences : algorithms.numberOfPermutationsWithNoConsecutiveSequences,
    numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts : algorithms.numberOfPermutationsThatMeetAnMcsSpecificationByLengthsAndCounts,
    numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts : algorithms.numberOfPermutationsThatMeetCertainMcsSpecificationsByLengthsAndCounts,
    getNewSelectionCondition : algorithms.getNewSelectionCondition,
    numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo : algorithms.numberOfPermutationsWithAtLeastOneMaximalConsecutiveSequenceOfLengthGreaterThanOrEqualTo,
    numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange : algorithms.numberOfPermutationsWithMaximalConsecutiveSequencesOnlyInLengthRange,
    numberOfPermutationsWithAtLeastOneConsecutiveSequenceOfLength : algorithms.numberOfPermutationsWithAtLeastOneConsecutiveSequenceOfLength,
    numberOfPermutationsWithGivenNumberOfConsecutiveSequencesOfLength : algorithms.numberOfPermutationsWithGivenNumberOfConsecutiveSequencesOfLength,
    numberOfPermutationsByConsecutivePairCount : algorithms.numberOfPermutationsByConsecutivePairCount
};